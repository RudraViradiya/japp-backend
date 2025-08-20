import express from "express";
import user from "../controller/auth.controller.js";

const router = express.Router();

router.post("/login", user.login);

router.post("/signUp", user.signUp);

export default router;
