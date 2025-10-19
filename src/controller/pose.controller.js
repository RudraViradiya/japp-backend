import PoseModel from "../model/pose.model.js";
import poseValidator from "../utils/validation/poseValidator.js";
import validation from "../utils/validateRequest.js";

export const create = async (req, res) => {
  try {
    const data = req.body;

    const validateRequest = validation.validateParamsWithJoi(
      data,
      poseValidator.creationPose
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        status: 400,
        message: `Invalid Params: ${validateRequest.message}`,
      });
    }

    const poses = await PoseModel.findOne({
      name: data.name,
    });

    if (poses) {
      return res.badRequest({
        status: 400,
        message: "Pose with same name already exists",
      });
    }
    const payload = {
      userId: req.userId,
      name: data.name,
      data: data.data || {},
    };

    const pose = await PoseModel.create(payload);

    return res.ok({
      status: 200,
      message: "Pose created successfully",
      data: pose,
    });
  } catch (error) {
    console.log("🚀 - addPose - error:", error);
    return res.failureResponse();
  }
};

export const getAllByUser = async (req, res) => {
  try {
    const poses = await PoseModel.find({
      $or: [{ userId: req.userId }, { userId: null }],
    });

    return res.ok({
      status: 200,
      data: poses,
      message: "Pose list fetched successfully",
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export const deletePose = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.badRequest({
        status: 400,
        message: "Model ID is required",
      });
    }

    const deletedModel = await PoseModel.findByIdAndDelete(id);

    if (!deletedModel) {
      return res.badRequest({
        status: 400,
        message: "Pose not found",
      });
    }

    return res.ok({
      status: 200,
      data: deletedModel,
      message: "Pose deleted successfully",
    });
  } catch (error) {
    return res.failureResponse();
  }
};
