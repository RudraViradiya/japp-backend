import express from "express";
import { createRouteHandler } from "uploadthing/express";
import authRouter from "./auth.routes.js";
import modelRouter from "./model.routes.js";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/model", modelRouter);

export default router;
