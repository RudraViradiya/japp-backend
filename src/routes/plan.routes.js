// routes/planRoutes.js
import express from "express";
import {
  getPlanById,
  getPlans,
  getTopUpPlans,
} from "../controller/plan.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

router.get("/", tokenValidator, getPlans);

router.get("/topUps", tokenValidator, getTopUpPlans);

router.get("/:id", tokenValidator, getPlanById);

export default router;
