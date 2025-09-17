import file from "../controller/file.controller.js";
import express from "express";

const router = express.Router();

router.get("/get", file.getFiles);

export default router;
