import express from "express";
import tokenValidator from "../middleware/tokenValidator.js";
import { getAllAiShootTemplates } from "../controller/aiShootTemplate.controller.js";

const router = express.Router();

router.get("/", tokenValidator, getAllAiShootTemplates);

export default router;
