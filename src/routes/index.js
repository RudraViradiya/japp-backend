import express from "express";
import authRouter from "./auth.routes.js";
import fileRouter from "./files.routes.js";
import modelRouter from "./model.routes.js";
import materialRouter from "./material.routes.js";
import poseRouter from "./pose.routes.js";
import videoAngleRouter from "./videoAngle.routes.js";
import mediaRouter from "./media.routes.js";
import paymentRouter from "./payment.routes.js";
import planRouter from "./plan.routes.js";
import webHookRouter from "./webhook.routes.js";
import contactRouter from "./contact.routes.js";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/model", modelRouter);

router.use("/material", materialRouter);

router.use("/pose", poseRouter);

router.use("/videoAngle", videoAngleRouter);

router.use("/file", fileRouter);

router.use("/media", mediaRouter);

router.use("/payment", paymentRouter);

router.use("/subscription", planRouter);

router.use("/webhook", webHookRouter);

router.use("/contact", contactRouter);

export default router;
