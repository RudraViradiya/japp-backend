import LogModel from "../model/logs.model.js";
import MediaErrorModel from "../model/mediaError.model.js";
import UserModel from "../model/user.model.js";

// export const createMedia = async (req, res) => {
//   try {
//     const data = req.body;
//     const type = data.type;
//     const count = +data.count;

//     const user = await UserModel.findById(req.userId, { config: 1 });

//     if (type === "IMAGE_AI") {
//       if (user.config.aiImageCredit < count) {
//         return res.badRequest({
//           status: 400,
//           message:
//             "You do not have enough AI Image Credits to create AI Images",
//         });
//       }
//     }
//     return res.ok({
//       status: 200,
//       data: {},
//       message: "Media created Successfully",
//     });
//   } catch (error) {
//     return res.failureResponse();
//   }
// };

export const revertCredit = async (req, res) => {
  try {
    const { type, error } = req.body;
    const count = +req.body.count;

    if (!type) {
      return res.badRequest({ status: 400, message: "Media type is required" });
    }

    if (type === "IMAGE_AI") {
      await UserModel.updateOne(
        { _id: req.userId },
        { $inc: { "config.aiImageCredit": count } }
      );
    }
    if (type === "IMAGE") {
      await UserModel.updateOne(
        { _id: req.userId },
        { $inc: { "config.imageCredit": count } }
      );
    }
    if (type === "VIDEO") {
      await UserModel.updateOne(
        { _id: req.userId },
        { $inc: { "config.videoCredit": count } }
      );
    }

    await MediaErrorModel.create({
      type,
      revertCount: count,
      error: error || "Reverted Credit",
    });
    return res.ok({
      status: 200,
      data: {},
      message: "Verified creation successfully",
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export const validateMedia = async (req, res) => {
  try {
    const type = req.query.type;
    const count = +req.query.count;
    if (!type) {
      return res.badRequest({ status: 400, message: "Media type is required" });
    }

    const user = await UserModel.findById(req.userId);

    let note = "";
    let logType = "";
    if (type === "IMAGE_AI") {
      if (user.config.aiImageCredit < count) {
        return res.badRequest({
          status: 400,
          message:
            "You do not have enough AI Image Credits to create AI Images",
        });
      }
      await UserModel.updateOne(
        { _id: req.userId },
        { $inc: { "config.aiImageCredit": -count } }
      );
      logType = "AI_IMAGE_CREATED";
      note = "AI Image Created";
    }
    if (type === "IMAGE") {
      const hasLimit = user.config.imageCredit !== null;

      if (hasLimit && user.config.imageCredit < count) {
        return res.badRequest({
          status: 400,
          message: "You don't have enough image credits to download image",
        });
      }
      if (hasLimit)
        await UserModel.updateOne(
          { _id: req.userId },
          { $inc: { "config.imageCredit": -count } }
        );

      note = "Image Created";
      logType = count === 1 ? "IMAGE_CREATED" : "MULTI_IMAGES_CREATED";
    }
    if (type === "VIDEO") {
      const hasLimit = user.config.videoCredit !== null;

      if (hasLimit && user.config.videoCredit < count) {
        return res.badRequest({
          status: 400,
          message: "You don't have enough video credits to download video",
        });
      }
      if (hasLimit)
        await UserModel.updateOne(
          { _id: req.userId },
          { $inc: { "config.videoCredit": -count } }
        );

      note = "Video Created";
      logType = count === 1 ? "VIDEO_CREATED" : "MULTI_VIDEO_CREATED";
    }
    await LogModel.create({
      data: { count },
      note,
      type: logType,
      userId: req.userId,
    });
    return res.ok({
      status: 200,
      data: {},
      message: "Verified creation successfully",
    });
  } catch (error) {
    console.log("🚀 - validateMedia - error:", error);
    return res.failureResponse();
  }
};
