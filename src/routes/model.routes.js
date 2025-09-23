import express from "express";
import multer from "multer";
import {
  create,
  deleteById,
  getAllByUser,
  getById,
  getByIdEmbed,
  updateById,
  updateConfigById,
} from "../controller/model.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  tokenValidator,
  upload.fields([
    { name: "mainFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  create
);

router.get("/", tokenValidator, getAllByUser);

router.get("/:id", tokenValidator, getById);

router.get("/embed/:id", getByIdEmbed);

router.put(
  "/:id",
  tokenValidator,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  updateById
);

router.put("/updateConfig/:id", tokenValidator, updateConfigById);

router.delete("/:id", tokenValidator, deleteById);

export default router;
