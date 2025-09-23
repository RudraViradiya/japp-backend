import mongoose from "mongoose";
import MaterialModel from "../model/material.model.js";
import { uploadToR2 } from "../storage/cloudflare.js";
import materialValidator from "../utils/validation/materialValidator.js";
import validation from "../utils/validateRequest.js";
import UserModel from "../model/user.model.js";

export const getMetalMaterials = async (req, res) => {
  try {
    if (!req.userId) {
      return res.badRequest({
        status: 400,
        message: "UserId is required",
      });
    }
    const materials = await MaterialModel.aggregate([
      {
        $match: {
          category: "metal_material",
          $or: [
            { userId: null },
            { userId: new mongoose.Types.ObjectId(req.userId) },
          ],
        },
      },
      {
        $facet: {
          userItems: [
            { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
            { $sort: { createdAt: -1 } },
          ],
          defaultItems: [{ $match: { userId: null } }],
        },
      },
      {
        $project: {
          allItems: { $concatArrays: ["$userItems", "$defaultItems"] },
        },
      },
      { $unwind: "$allItems" },
      { $replaceRoot: { newRoot: "$allItems" } },
    ]);

    return res.ok({
      status: 200,
      data: materials,
      message: "Metal Material fetched successfully",
      count: materials.length,
    });
  } catch (error) {
    console.log("🚀 - getMetalMaterials - error:", error);
    return res.failureResponse();
  }
};

export const getGemMaterials = async (req, res) => {
  try {
    if (!req.userId) {
      return res.badRequest({
        status: 400,
        message: "UserId is required",
      });
    }

    const materials = await MaterialModel.aggregate([
      {
        $match: {
          category: "gem_material",
          $or: [
            { userId: null },
            { userId: new mongoose.Types.ObjectId(req.userId) },
          ],
        },
      },
      {
        $facet: {
          userItems: [
            { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
            { $sort: { createdAt: -1 } },
          ],
          defaultItems: [{ $match: { userId: null } }],
        },
      },
      {
        $project: {
          allItems: { $concatArrays: ["$userItems", "$defaultItems"] },
        },
      },
      { $unwind: "$allItems" },
      { $replaceRoot: { newRoot: "$allItems" } },
    ]);
    return res.ok({
      status: 200,
      data: materials,
      message: "Gem Material fetched successfully",
      count: materials.length,
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export const getSceneMaterials = async (req, res) => {
  try {
    if (!req.userId) {
      return res.badRequest({
        status: 400,
        message: "UserId is required",
      });
    }

    const materials = await MaterialModel.find({
      category: { $nin: ["gem_material", "metal_material"] },
    });
    return res.ok({
      status: 200,
      data: materials,
      message: "Scene Material fetched successfully",
      count: materials.length,
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export const addMaterial = async (req, res) => {
  const data = req.body;

  const mainFile = req.files.file?.[0];
  const thumbnail = req.files.thumbnail?.[0];

  delete data.thumbnail;
  delete data.mainFile;
  try {
    const user = await UserModel.findOne({ _id: req.userId });

    if (user.config.customAssets <= 0) {
      return res.badRequest({
        status: 400,
        message: "You do not have enough model credits to create custom assets",
      });
    }

    const validateRequest = validation.validateParamsWithJoi(
      data,
      materialValidator.creationMaterial
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        status: 400,
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const modelId = new mongoose.Types.ObjectId();

    const mainSplit = mainFile.originalname.split(".");
    const mainPath = `${req.userId}/assets/${data.category}/${modelId}.${
      mainSplit[mainSplit.length - 1]
    }`;

    const thumbnailSplit = thumbnail.originalname.split(".");
    const thumbPath = `${req.userId}/assets/thumbnail/${
      data.category
    }-${modelId}.${thumbnailSplit[thumbnailSplit.length - 1]}`;

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
    payload.type = data.category === "metal_material" ? "metal_polished" : "";
    payload.userId = req.userId;
    payload.thumbnail = thumbnailUrl;
    payload.value = fileUrl;
    payload.weight = 50;
    const entry = new MaterialModel({ _id: modelId, ...payload });
    await entry.save();

    await UserModel.updateOne(
      { _id: req.userId },
      { $inc: { "config.customAssets": -1 } }
    );

    return res.ok({
      status: 200,
      data: entry,
      message: "Material created Successfully",
    });
  } catch (error) {
    console.log("🚀 - create - error:", error);
    return res.failureResponse();
  }
};
