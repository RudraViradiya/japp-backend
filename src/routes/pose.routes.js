import express from "express";
import tokenValidator from "../middleware/tokenValidator.js";
import {
  create,
  deletePose,
  getAllByUser,
} from "../controller/pose.controller.js";

const router = express.Router();

router.post("/", tokenValidator, create);

router.get("/", tokenValidator, getAllByUser);

router.delete("/:id", tokenValidator, deletePose);

export default router;
