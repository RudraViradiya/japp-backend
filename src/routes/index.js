import express from "express";
import authRouter from "./auth.routes.js";
import fileRouter from "./files.routes.js";
import modelRouter from "./model.routes.js";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/model", modelRouter);

router.use("/file", fileRouter);

export default router;
