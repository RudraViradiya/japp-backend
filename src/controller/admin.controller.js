import LogModel from "../model/logs.model.js";
import PlanModel from "../model/plan.model.js";
import UserModel from "../model/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find(
      {},
      { password: 0, otp: 0, otpExpires: 0 }
    );

    return res.ok({
      status: 200,
      message: "Users fetched successfully.",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
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

    return res.ok({
      status: 200,
      message: "User fetched successfully.",
      data: user,
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
      { new: true, select: "-password -otp -otpExpires" }
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

    if (plan.durationInDays !== Number.MAX_SAFE_INTEGER) {
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
      { new: true, select: "-password -otp -otpExpires" }
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

    // Default range: last 7 days
    const endDate = end ? new Date(end) : new Date();
    const startDate = start
      ? new Date(start)
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Build dynamic match condition
    const match = {
      createdAt: { $gte: startDate, $lte: endDate },
    };
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

    const endDate = end ? new Date(+end) : new Date();
    const startDate = start
      ? new Date(+start)
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const logs = await LogModel.aggregate([
      {
        $match: {
          type: "USER_CREATED",
          createdAt: { $gte: startDate, $lte: endDate },
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

    const endDate = end ? new Date(end) : new Date();
    const startDate = start
      ? new Date(start)
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
