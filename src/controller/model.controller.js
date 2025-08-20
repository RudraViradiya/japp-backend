import ModelModel from "../model/model.model.js";
import validation from "../utils/validateRequest.js";
import modelValidator from "../utils/validation/modelValidator.js";
import { fetchDecodedToken } from "../middleware/tokenValidator.js";
import mongoose from "mongoose";
import { uploadToR2 } from "../storage/cloudflare.js";

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
    const mainPath = `${userId}/${modelId}/main/${Date.now()}-${
      mainSplit[mainSplit.length - 1]
    }`;
    const thumbnailSplit = thumbnail.originalname.split(".");
    const thumbPath = `${userId}/${modelId}/thumbnail/${Date.now()}-${
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
    payload.materialConfig = JSON.parse(payload.materialConfig);
    payload.sceneConfig = JSON.parse(payload.sceneConfig);
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

    console.log("🚀 - getAllByUser - userId:", userId);
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

export default { create, getAllByUser, getById };
