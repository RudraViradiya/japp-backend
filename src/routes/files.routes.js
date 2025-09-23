import express from "express";
import { getFiles } from "../controller/file.controller.js";

const router = express.Router();

router.get("/get", getFiles);

export default router;
