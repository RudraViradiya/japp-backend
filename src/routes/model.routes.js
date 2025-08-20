import express from "express";
import multer from "multer";
import model from "../controller/model.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/create",
  upload.fields([
    { name: "mainFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  model.create
);

router.get("/getAll", tokenValidator, model.getAllByUser);

router.get("/:id", tokenValidator, model.getById);

export default router;
