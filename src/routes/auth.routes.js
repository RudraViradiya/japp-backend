import express from "express";
import {
  login,
  verifyOtp,
  resendOtp,
  signUp,
  getUserDetails,
} from "../controller/auth.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

router.post("/login", login);

router.post("/verifyOtp", verifyOtp);

router.post("/resendOtp", resendOtp);

router.post("/signUp", signUp);

router.get("/", tokenValidator, getUserDetails);

export default router;
