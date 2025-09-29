import express from "express";
import { revertCredit, validateMedia } from "../controller/media.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

// router.post("/", tokenValidator, createMedia);

router.post("/revertCredit", tokenValidator, revertCredit);

router.get("/validate", tokenValidator, validateMedia);

export default router;
