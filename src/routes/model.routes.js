import express from "express";
import multer from "multer";
import model from "../controller/model.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/create",
  tokenValidator,
  upload.fields([
    { name: "mainFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  model.create
);

router.get("/getAll", tokenValidator, model.getAllByUser);

router.get("/:id", tokenValidator, model.getById);

router.put(
  "/:id",
  tokenValidator,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  model.updateById
);

router.put("/updateConfig/:id", tokenValidator, model.updateConfigById);

router.delete("/:id", tokenValidator, model.deleteById);

export default router;
