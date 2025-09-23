import UserModel from "../model/user.model.js";

export const createMedia = async (req, res) => {
  try {
    const data = req.body;
    const type = data.type;

    const user = await UserModel.findById(req.userId);
    if (type === "IMAGE_AI") {
      if (user.config.aiImageCredit <= 0) {
        return res.badRequest({
          status: 400,
          message:
            "You do not have enough AI Image Credits to create AI Images",
        });
      }

      await UserModel.updateOne(
        { _id: req.userId },
        { $inc: { "config.aiImageCredit": -1 } }
      );
    }
    return res.ok({
      status: 200,
      data: {},
      message: "Media created Successfully",
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export const validateMedia = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.badRequest({ status: 400, message: "Media type is required" });
    }

    const user = await UserModel.findById(req.userId);
    if (type === "IMAGE_AI") {
      if (user.config.aiImageCredit <= 0) {
        return res.badRequest({
          status: 400,
          message:
            "You do not have enough AI Image Credits to create AI Images",
        });
      }
    }
    return res.ok({
      status: 200,
      data: {},
      message: "Verified creation successfully",
    });
  } catch (error) {
    return res.failureResponse();
  }
};
