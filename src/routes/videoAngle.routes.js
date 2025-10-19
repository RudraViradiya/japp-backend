import express from "express";
import tokenValidator from "../middleware/tokenValidator.js";
import {
  create,
  deleteVideoAngle,
  getAllByUser,
} from "../controller/videoAngles.controller.js";

const router = express.Router();

router.post("/", tokenValidator, create);

router.get("/", tokenValidator, getAllByUser);

router.delete("/:id", tokenValidator, deleteVideoAngle);

export default router;
