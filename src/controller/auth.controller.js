import UserModel from "../model/user.model.js";
import validation from "../utils/validateRequest.js";
import authValidator from "../utils/validation/authValidator.js";
import { generateToken } from "../utils/common.js";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../utils/emailProvider.js";
import { DEFAULT_PLAN, EMPTY_PLAN } from "../seeders/plans/subscription.js";

export const signUp = async (req, res) => {
  const data = req.body;
  try {
    const validateRequest = validation.validateParamsWithJoi(
      data,
      authValidator.creationUser
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        status: 400,
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const existingUser = await UserModel.findOne({ email: data.email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.badRequest({
          status: 409,
          message: "User with this email already exists and is verified.",
        });
      } else {
        await UserModel.deleteOne({ email: data.email });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    const entry = new UserModel({
      ...validateRequest.value,
      isVerified: false,
      otp,
      otpExpires,
      activePlans: [],
      password: await bcrypt.hash(validateRequest.value.password, 8),
    });
    await entry.save();

    // Send OTP via email (custom template)
    await sendOtpEmail(entry.email, entry.name, otp);

    return res.ok({
      status: 200,
      message:
        "OTP has been sent to your email. Please check your inbox or spam folder",
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.badRequest({ status: 404, message: "User not found" });
    }

    if (user.isVerified) {
      return res.badRequest({
        status: 400,
        message: "User already verified with this email",
      });
    }

    if (user.otp !== +otp) {
      return res.badRequest({ status: 400, message: "Invalid OTP" });
    }
    if (Date.now() > user.otpExpires) {
      return res.badRequest({ status: 400, message: "OTP Expired" });
    }

    const newPlan = DEFAULT_PLAN;
    const startDate = new Date();

    // add durationInDays from the plan
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + newPlan.durationInDays);

    // Mark verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    user.activePlans = [{ ...newPlan, startDate, endDate }];
    user.config = DEFAULT_PLAN.features;
    await user.save();

    // Generate tokens only now
    const { token, refreshToken } = await generateToken(user._id);

    return res.ok({
      status: 200,
      data: { data: user, token, refreshToken },
      message: "Account verified successfully",
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.badRequest({ message: "Email is required" });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.badRequest({ message: "User not found" });
    }

    // If already verified, stop
    if (user.isVerified) {
      return res.badRequest({ message: "User is already verified" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    await UserModel.findOneAndUpdate(
      { email },
      { otp, otpExpires },
      { new: true }
    );

    // Send OTP email
    await sendOtpEmail(user.email, user.name, otp);

    return res.ok({
      message:
        "We’ve resent the OTP! Check your inbox — and don’t forget to look in your spam folder",
    });
  } catch (err) {
    return res.failureResponse();
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (user) {
      const validPass = await bcrypt.compare(password, user.password);

      if (validPass) {
        const { token, refreshToken } = await generateToken(user._id);

        if (user.isBlocked) {
          return res.badRequest({
            message: "User is blocked, please contact admin",
          });
        }
        // if (!user.isVerified) {
        //   return res.badRequest({
        //     message: "User not verified, please verify your email",
        //   });
        // }

        return res.ok({
          data: { data: user, refreshToken, token },
          message: "User login Successfully",
        });
      }
    }

    return await res.badRequest({
      message: "UserName or Password Not Matched Please Re Enter..!",
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export const getUserDetails = async (req, res) => {
  try {
    let user = await UserModel.findById(req.userId).select(
      "-password -otp -otpExpires"
    );

    if (!user) {
      return res.badRequest({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.unAuthorizedRequest({
        message: "User is blocked, please contact admin",
      });
    }

    const activePlanIndex = user.activePlans.findIndex(
      (i) => i.name === "Free Trail"
    );

    if (activePlanIndex !== -1) {
      const currentDate = new Date();
      const planEndDate = new Date(user.activePlans[activePlanIndex].endDate);

      if (currentDate > planEndDate) {
        const finalPlans = user.activePlans;
        finalPlans.splice(activePlanIndex, 1);

        // Prepare the update object
        const updateData =
          finalPlans.length > 0
            ? { activePlans: finalPlans }
            : { activePlans: [], config: EMPTY_PLAN.features };

        user = await UserModel.findOneAndUpdate(
          { _id: user._id },
          { $set: updateData },
          { new: true }
        );
      }
    }

    return res.ok({
      data: user,
      message: "User details fetched successfully",
    });
  } catch (error) {
    console.error("Get User Details Error:", error);
    return res.failureResponse();
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phoneNo } = req.body;

    if (!name || !phoneNo) {
      return res.badRequest({
        status: 400,
        message: "Name and Phone number are required.",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.badRequest({
        status: 404,
        message: "User not found.",
      });
    }

    user.name = name;
    user.phoneNo = phoneNo;
    await user.save();

    return res.ok({
      status: 200,
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    if (!password) {
      return res.badRequest({
        status: 400,
        message: "New password is required.",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.badRequest({
        status: 404,
        message: "User not found.",
      });
    }

    user.password = await bcrypt.hash(password, 8);
    await user.save();

    return res.ok({
      status: 200,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.failureResponse();
  }
};
