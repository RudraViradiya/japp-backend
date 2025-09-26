// routes/paymentRoutes.js
import express from "express";
import { createOrder } from "../controller/payment.controller.js";
import tokenValidator from "../middleware/tokenValidator.js";

const router = express.Router();

// router.post("/create-subscription", tokenValidator, createSubscription);

// router.post("/cancel-subscription", tokenValidator, cancelSubscription);

// router.post("/verify-payment", tokenValidator, verifyPayment);

router.post("/create-order", tokenValidator, createOrder);

export default router;
