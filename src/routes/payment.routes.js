// routes/paymentRoutes.js
import express from "express";
import { createSubscription } from "../controller/payment.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

router.post("/create-subscription", tokenValidator, createSubscription);

// router.post("/verify-payment", tokenValidator, verifyPayment);

export default router;
