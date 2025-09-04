import mongoose from "mongoose";
import { fetchDecodedToken } from "../middleware/tokenValidator.js";
import ModelModel from "../model/model.model.js";
import { uploadToR2 } from "../storage/cloudflare.js";
import validation from "../utils/validateRequest.js";
import modelValidator from "../utils/validation/modelValidator.js";
import { flattenObject } from "../utils/index.js";

const create = async (req, res) => {
  const data = req.body;
  const { userId } = fetchDecodedToken(req);

  const mainFile = req.files.mainFile?.[0];
  const thumbnail = req.files.thumbnail?.[0];

  delete data.thumbnail;
  delete data.mainFile;
  try {
    const validateRequest = validation.validateParamsWithJoi(
      data,
      modelValidator.creationModel
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        status: 400,
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    if (!mainFile || !thumbnail) {
      return res.badRequest({
        status: 400,
        message: "MainFile and thumbnail are required.",
      });
    }

    const modelId = new mongoose.Types.ObjectId();

    const mainSplit = mainFile.originalname.split(".");
    const mainPath = `${userId}/${modelId}/main.${
      mainSplit[mainSplit.length - 1]
    }`;
    const thumbnailSplit = thumbnail.originalname.split(".");
    const thumbPath = `${userId}/${modelId}/thumbnail.${
      thumbnailSplit[thumbnailSplit.length - 1]
    }`;

    // const [fileUrl, thumbnailUrl] =
    const fileUrl = await uploadToR2(
      mainFile.buffer,
      mainPath,
      mainFile.mimetype
    );
    const thumbnailUrl = await uploadToR2(
      thumbnail.buffer,
      thumbPath,
      thumbnail.mimetype
    );

    const payload = validateRequest.value;
    payload.modelUrl = fileUrl;
    payload.modelConfig = JSON.parse(payload.modelConfig);
    payload.userId = userId;
    payload.thumbnail = thumbnailUrl;
    const entry = new ModelModel({ _id: modelId, ...payload });
    await entry.save();

    return res.ok({
      status: 200,
      data: entry,
      message: "User created Successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error });
  }
};

const getAllByUser = async (req, res) => {
  try {
    const { userId } = fetchDecodedToken(req);

    if (!userId) {
      return res.badRequest({
        status: 400,
        message: "UserId is required",
      });
    }

    const models = await ModelModel.find({ userId: userId });

    return res.ok({
      status: 200,
      data: models,
      message: "Models fetched successfully",
      count: models.length,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.badRequest({
        status: 400,
        message: "Model ID is required",
      });
    }

    const model = await ModelModel.findById(id);

    if (!model) {
      return res.notFound({
        status: 404,
        message: "Model not found",
      });
    }

    return res.ok({
      status: 200,
      data: model,
      message: "Model fetched successfully",
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.badRequest({
        status: 400,
        message: "Invalid model ID format",
      });
    }

    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.badRequest({
        status: 400,
        message: "Model ID is required",
      });
    }

    const deletedModel = await ModelModel.findByIdAndDelete(id);

    if (!deletedModel) {
      return res.notFound({
        status: 404,
        message: "Model not found",
      });
    }

    return res.ok({
      status: 200,
      data: deletedModel,
      message: "Model deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.badRequest({
        status: 400,
        message: "Invalid model ID format",
      });
    }

    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = fetchDecodedToken(req);

    if (!id) {
      return res.badRequest({
        status: 400,
        message: "Model ID is required",
      });
    }

    const updateData = { ...req.body };

    const thumbnail = req.files?.thumbnail?.[0];

    if (!updateData && !thumbnail) {
      return res.badRequest({
        status: 400,
        message:
          "At least one field (thumbnail, modelConfig, name, type, note) is required",
      });
    }

    // Ensure model exists
    const model = await ModelModel.findById(id);
    if (!model) {
      return res.notFound({
        status: 404,
        message: "Model not found",
      });
    }

    if (thumbnail) {
      const thumbnailSplit = thumbnail.originalname.split(".");
      const thumbPath = `${userId}/${id}/thumbnail.${
        thumbnailSplit[thumbnailSplit.length - 1]
      }`;
      const thumbnailUrl = await uploadToR2(
        thumbnail.buffer,
        thumbPath,
        thumbnail.mimetype
      );
      updateData.thumbnail = thumbnailUrl;
    }

    if (updateData.modelConfig) {
      updateData.modelConfig = JSON.parse(updateData.modelConfig);
    }

    if (updateData.materialConfig) {
      updateData.materialConfig = JSON.parse(updateData.materialConfig);
    }
    if (updateData.camera) {
      updateData["modelConfig.camera"] = JSON.parse(updateData.camera);
    }
    if (updateData.sceneConfig) {
      updateData.sceneConfig = JSON.parse(updateData.sceneConfig);
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      "thumbnail",
      "modelConfig",
      "materialConfig",
      "modelConfig.camera",
      "sceneConfig",
      "name",
      "type",
      "note",
    ];
    Object.keys(updateData).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      }
    });
    ``;
    const updatedModel = await ModelModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.ok({
      status: 200,
      data: updatedModel,
      message: "Model updated successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.badRequest({
        status: 400,
        message: "Invalid model ID format",
      });
    }
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const updateConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = fetchDecodedToken(req);

    if (!id) {
      return res.badRequest({
        status: 400,
        message: "Model ID is required",
      });
    }

    const modelConfig = req.body;

    // Ensure model exists
    const model = await ModelModel.findById(id);

    if (!model) {
      return res.notFound({
        status: 404,
        message: "Model not found",
      });
    }

    const updatedModel = await ModelModel.findByIdAndUpdate(
      id,
      { $set: { modelConfig } },
      { new: true, runValidators: true }
    );

    return res.ok({
      status: 200,
      data: updatedModel,
      message: "Model updated successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.badRequest({
        status: 400,
        message: "Invalid model ID format",
      });
    }
    return res.status(500).json({ status: 500, message: error.message });
  }
};

export default {
  create,
  getAllByUser,
  getById,
  deleteById,
  updateById,
  updateConfigById,
};
