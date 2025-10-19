import VideoAngleModel from "../model/videoAngle.model.js";
import videoAngleValidator from "../utils/validation/videoAngleValidator.js";
import validation from "../utils/validateRequest.js";

export const create = async (req, res) => {
  try {
    const data = req.body;

    const validateRequest = validation.validateParamsWithJoi(
      data,
      videoAngleValidator.creationVideoAngle
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        status: 400,
        message: `Invalid Params: ${validateRequest.message}`,
      });
    }

    const poses = await VideoAngleModel.findOne({
      name: data.name,
    });

    if (poses) {
      return res.badRequest({
        status: 400,
        message: "Video Angle with same name already exists",
      });
    }
    const payload = {
      userId: req.userId,
      name: data.name,
      duration: data.duration,
      data: data.data || {},
    };

    const pose = await VideoAngleModel.create(payload);

    return res.ok({
      status: 200,
      message: "Video Angle created successfully",
      data: pose,
    });
  } catch (error) {
    console.log("🚀 - create - error:", error);
    return res.failureResponse();
  }
};

export const getAllByUser = async (req, res) => {
  try {
    const poses = await VideoAngleModel.find({
      $or: [{ userId: req.userId }, { userId: null }],
    });

    return res.ok({
      status: 200,
      data: poses,
      message: "Video Angle list fetched successfully",
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export const deleteVideoAngle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.badRequest({
        status: 400,
        message: "Model ID is required",
      });
    }

    const deletedModel = await VideoAngleModel.findByIdAndDelete(id);

    if (!deletedModel) {
      return res.badRequest({
        status: 400,
        message: "Video Angle not found",
      });
    }

    return res.ok({
      status: 200,
      data: deletedModel,
      message: "Video Angle deleted successfully",
    });
  } catch (error) {
    return res.failureResponse();
  }
};
