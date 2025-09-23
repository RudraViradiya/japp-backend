import express from "express";
import { createMedia, validateMedia } from "../controller/media.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

router.post("/", tokenValidator, createMedia);

router.get("/validate", tokenValidator, validateMedia);

export default router;
