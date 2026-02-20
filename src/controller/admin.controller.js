import LogModel from "../model/logs.model.js";
import PlanModel from "../model/plan.model.js";
import UserModel from "../model/user.model.js";
import MaterialModel from "../model/material.model.js";
import ModelModel from "../model/model.model.js";
import {
  uploadToR2,
  deleteFromR2,
  getFolderSize,
} from "../storage/cloudflare.js";
import materialValidator from "../utils/validation/materialValidator.js";
import validation from "../utils/validateRequest.js";
import mongoose from "mongoose";

export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const orConditions = [{ name: searchRegex }, { email: searchRegex }];

      if (!isNaN(search)) {
        orConditions.push({ phoneNo: Number(search) });
      }

      query.$or = orConditions;
    }

    const pipeline = [
      ...(Object.keys(query).length ? [{ $match: query }] : []),
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "models",
          localField: "_id",
          foreignField: "userId",
          as: "userModels",
        },
      },
      {
        $addFields: {
          modelCount: { $size: "$userModels" },
        },
      },
      {
        $project: {
          password: 0,
          otp: 0,
          otpExpires: 0,
          userModels: 0,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await UserModel.aggregate(pipeline);

    const users = result[0].data;
    const totalCount = result[0].metadata[0]?.total || 0;

    return res.ok({
      status: 200,
      message: "Users fetched successfully.",
      data: {
        data: users,
        count: users.length,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.failureResponse();
  }
};

export const getUsersList = async (req, res) => {
  try {
    const users = await UserModel.find({}, { name: 1 }).sort({ createdAt: -1 });

    return res.ok({
      status: 200,
      message: "Users list fetched successfully.",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users list:", error);
    return res.failureResponse();
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id, {
      password: 0,
      otp: 0,
      otpExpires: 0,
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found.",
      });
    }

    const folderSize = await getFolderSize(id);
    const userObj = user.toObject();
    userObj.storageUsed = folderSize;

    return res.ok({
      status: 200,
      message: "User fetched successfully.",
      data: userObj,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.failureResponse();
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, select: "-password -otp -otpExpires" },
    );

    if (!user) {
      return res.badRequest({
        status: 404,
        message: "User not found.",
      });
    }

    return res.ok({
      status: 200,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.failureResponse();
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await PlanModel.find({ isActive: true });
    res.ok({
      status: 200,
      message: "Plans fetched successfully.",
      data: plans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const upgradePlan = async (req, res) => {
  try {
    const { planId, userId } = req.body;
    const plan = await PlanModel.findOne({ planId });
    const user = await UserModel.findById(userId);

    if (!plan) {
      return res.badRequest({
        status: 404,
        message: "Plan not found.",
      });
    }
    if (!user) {
      return res.badRequest({
        status: 404,
        message: "User not found.",
      });
    }

    let startDate = null;
    let endDate = null;

    if (plan.durationInDays !== null) {
      startDate = new Date();
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationInDays);
    }

    if (user.activePlans.length > 1) {
      const newConfig = [user.config, plan.features]
        .sort((a, b) => a.weight - b.weight)
        .reduce((acc, curr) => {
          if (!acc) return curr;
          return curr;
        }, undefined);

      await UserModel.findByIdAndUpdate(userId, {
        $push: {
          activePlans: {
            ...plan,
            startDate,
            endDate,
            status: "active",
          },
        },
        $set: { config: newConfig },
      });
    } else {
      await UserModel.findByIdAndUpdate(userId, {
        $push: {
          activePlans: {
            ...plan,
            startDate,
            endDate,
            status: "active",
          },
        },
        $set: { config: plan.features },
      });
    }

    return res.ok({
      status: 200,
      message: "Plan upgraded successfully.",
    });
  } catch (error) {
    console.error("Error upgrading plan:", error);
    return res.failureResponse();
  }
};

export const removeActivePlan = async (req, res) => {
  try {
    const { userId, planId } = req.params;

    // Validate inputs
    if (!userId || !planId) {
      return res.badRequest({
        status: 400,
        message: "User ID and Plan Name are required.",
      });
    }

    const plan = await PlanModel.findOne({ planId });

    if (!plan) {
      return res.badRequest({
        status: 404,
        message: "Plan not found.",
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { activePlans: { planId } } },
      { new: true, select: "-password -otp -otpExpires" },
    );

    if (!updatedUser) {
      return res.badRequest({
        status: 404,
        message: "User not found.",
      });
    }

    return res.ok({
      status: 200,
      message: `Plan '${plan.name}' removed successfully.`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error removing active plan:", error);
    return res.failureResponse();
  }
};

export const getAllStatistics = async (req, res) => {
  try {
    const { start, end } = req.query;

    const match = {
      createdAt: {},
    };

    if (start) {
      match.createdAt.$gte = new Date(+start);
    }
    if (end) {
      match.createdAt.$lte = new Date(+end);
    }

    const result = await LogModel.aggregate([
      // 1️⃣ Remove unwanted log types
      {
        $match: {
          type: { $nin: ["USER_CREATED", "USER_ACTIVATED"] },
          ...match, // optional (e.g. date range filter)
        },
      },

      // 2️⃣ Group by userId + type → count logs and track latest date
      {
        $group: {
          _id: { userId: "$userId", type: "$type" },
          count: { $sum: 1 },
          latest: { $max: "$createdAt" },
        },
      },

      // 3️⃣ Group by user → collect log types and track overall latest activity
      {
        $group: {
          _id: "$_id.userId",
          logs: { $push: { k: "$_id.type", v: "$count" } },
          latestActivity: { $max: "$latest" },
        },
      },

      // 4️⃣ Join with users collection to get name
      {
        $lookup: {
          from: "users",
          localField: "_id", // Log.userId
          foreignField: "_id", // User._id
          as: "user",
        },
      },

      // 5️⃣ Format output
      {
        $project: {
          _id: 0,
          userId: "$_id",
          userName: {
            $ifNull: [{ $arrayElemAt: ["$user.name", 0] }, "Unknown"],
          },
          stats: { $arrayToObject: "$logs" },
          latestActivity: 1,
        },
      },

      // 6️⃣ Sort by latest activity (newest first)
      { $sort: { latestActivity: -1 } },
    ]);

    return res.ok({
      status: 200,
      message: `Logs Stats fetched successfully.`,
      data: result,
    });
  } catch (error) {
    console.error("Error removing active plan:", error);
    return res.failureResponse();
  }
};

export const getUserCreatedLogs = async (req, res) => {
  try {
    const { start, end } = req.query;

    const createdAt = {};

    if (start) {
      createdAt.$gte = new Date(+start);
    }
    if (end) {
      createdAt.$lte = new Date(+end);
    }

    const logs = await LogModel.aggregate([
      {
        $match: {
          type: "USER_CREATED",
          createdAt,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $addFields: {
          activePlan: { $size: { $ifNull: ["$user.activePlans", []] } },
        },
      },
      {
        $project: {
          _id: 0,
          createdAt: 1,
          updatedAt: 1,
          activePlan: 1,
          userName: "$user.name",
          userEmail: "$user.email",
          isVerified: "$user.isVerified",
          config: "$user.config",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json({
      status: 200,
      message: "User logs fetched successfully.",
      data: logs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch USER_CREATED logs",
      error: err.message,
    });
  }
};

export const getUserActivatedLogs = async (req, res) => {
  try {
    const { start, end } = req.query;

    const endDate = end ? new Date(+end) : new Date();
    const startDate = start
      ? new Date(+start)
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const logs = await LogModel.aggregate([
      {
        $match: {
          type: "USER_ACTIVATED",
          updatedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          data: 1,
          userName: "$user.name",
          userEmail: "$user.email",
        },
      },
      { $sort: { updatedAt: -1 } },
    ]);

    res.json({
      status: 200,
      message: "User activity fetched successfully.",
      data: logs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch USER_ACTIVATED logs",
      error: err.message,
    });
  }
};

export const getAllMaterials = async (req, res) => {
  try {
    const { search, category } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [];

    if (category) {
      pipeline.push({
        $match: { category },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { "user.name": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          user: "$user.name",
        },
      },
      {
        $project: {
          userId: 0,
          "user.password": 0,
          "user.otp": 0,
          "user.otpExpires": 0,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    );

    const result = await MaterialModel.aggregate(pipeline);

    const materials = result[0].data;
    const totalCount = result[0].metadata[0]?.total || 0;

    return res.ok({
      status: 200,
      data: {
        data: materials,
        count: materials.length,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
      message: "Materials fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return res.failureResponse();
  }
};

export const addMaterial = async (req, res) => {
  const data = req.body;

  const mainFile = req.files.file?.[0];
  const thumbnail = req.files.thumbnail?.[0];

  if (!mainFile || !thumbnail) {
    return res.badRequest({
      status: 400,
      message: "Both file and thumbnail are required.",
    });
  }

  if (data.userId) {
    const user = await UserModel.findById(data.userId);
    if (!user) {
      return res.badRequest({
        status: 404,
        message: "User not found.",
      });
    }
  }

  delete data.thumbnail;
  delete data.mainFile;

  try {
    // Validate request
    const validateRequest = validation.validateParamsWithJoi(
      data,
      materialValidator.creationMaterial,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        status: 400,
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const modelId = new mongoose.Types.ObjectId();
    const isCommonAsset = !data.userId; // If no userId provided, it's a common asset

    // Determine paths
    let mainPath, thumbPath;

    if (isCommonAsset) {
      mainPath = `assets/${data.category}/${mainFile.originalname}`;
      thumbPath = `assets/thumbnails/${thumbnail.originalname}`;
    } else {
      mainPath = `${data.userId}/assets/${mainFile.originalname}`;
      thumbPath = `${data.userId}/assets/thumbnail/${thumbnail.originalname}`;
    }

    // Upload to R2
    const fileUrl = await uploadToR2(
      mainFile.buffer,
      mainPath,
      mainFile.mimetype,
    );
    const thumbnailUrl = await uploadToR2(
      thumbnail.buffer,
      thumbPath,
      thumbnail.mimetype,
    );

    const payload = validateRequest.value;
    payload.type =
      data.category === "metal_material" ? "metal_polished" : data.category; // Default type if metal
    payload.userId = isCommonAsset ? null : data.userId;
    payload.thumbnail = thumbnailUrl;
    payload.value = fileUrl;
    payload.weight = 50; // Default weight

    const entry = new MaterialModel({ _id: modelId, ...payload });
    await entry.save();

    return res.ok({
      status: 200,
      data: entry,
      message: "Material created Successfully",
    });
  } catch (error) {
    console.log("🚀 - admin addMaterial - error:", error);
    return res.failureResponse();
  }
};

export const editMaterial = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const thumbnail = req.files?.thumbnail?.[0];

  try {
    const material = await MaterialModel.findById(id);

    if (!material) {
      return res.badRequest({
        status: 404,
        message: "Material not found.",
      });
    }

    const isCommonAsset = !data.userId && !material.userId;
    const userId = data.userId || material.userId;

    if (thumbnail) {
      const thumbPath = isCommonAsset
        ? `assets/thumbnails/${thumbnail.originalname}`
        : `${userId}/assets/thumbnail/${thumbnail.originalname}`;

      const thumbnailUrl = await uploadToR2(
        thumbnail.buffer,
        thumbPath,
        thumbnail.mimetype,
      );
      data.thumbnail = thumbnailUrl;
    }

    delete data.file;

    const updatedMaterial = await MaterialModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );

    return res.ok({
      status: 200,
      data: updatedMaterial,
      message: "Material updated successfully",
    });
  } catch (error) {
    console.error("Error updating material:", error);
    return res.failureResponse();
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await MaterialModel.findByIdAndDelete(id);

    if (!material) {
      return res.badRequest({
        status: 404,
        message: "Material not found.",
      });
    }

    if (material.value) {
      await deleteFromR2(material.value);
    }

    if (material.thumbnail) {
      await deleteFromR2(material.thumbnail);
    }

    return res.ok({
      status: 200,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return res.failureResponse();
  }
};

export const getAllModels = async (req, res) => {
  try {
    const { search, category } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [];

    if (category) {
      pipeline.push({
        $match: { type: category }, // Model uses 'type' instead of 'category' based on model.controller.js getAllByUser search logic
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { "user.name": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          user: "$user.name",
        },
      },
      {
        $project: {
          userId: 0,
          "user.password": 0,
          "user.otp": 0,
          "user.otpExpires": 0,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    );

    const result = await ModelModel.aggregate(pipeline);

    const models = result[0].data;
    const totalCount = result[0].metadata[0]?.total || 0;

    return res.ok({
      status: 200,
      data: {
        data: models,
        count: models.length,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
      message: "Models fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return res.failureResponse();
  }
};
