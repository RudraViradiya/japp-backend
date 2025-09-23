import express from "express";
import multer from "multer";
import {
  addMaterial,
  getGemMaterials,
  getMetalMaterials,
  getSceneMaterials,
} from "../controller/material.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  tokenValidator,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  addMaterial
);

router.get("/getMetals", tokenValidator, getMetalMaterials);

router.get("/getGems", tokenValidator, getGemMaterials);

router.get("/getScenes", tokenValidator, getSceneMaterials);

export default router;
