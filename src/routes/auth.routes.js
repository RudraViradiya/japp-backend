import express from "express";
import user from "../controller/auth.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

router.post("/login", user.login);

router.post("/verifyOtp", user.verifyOtp);

router.post("/resendOtp", user.resendOtp);

router.post("/signUp", user.signUp);

router.get("/me", tokenValidator, user.getUserDetails);

export default router;
