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
