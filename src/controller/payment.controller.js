// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import PlanModel from "../model/plan.model.js";
import TransactionModel from "../model/transaction.model.js";
import UserModel from "../model/user.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// export const createOrder = async (req, res) => {
//   try {
//     const { planId, currency } = req.body;

//     const userId = req.userId;
//     const plan = await PlanModel.findOne({ planId });
//     if (!plan)
//       return res.badRequest({ status: 400, message: "Plan not found" });

//     const priceObj = plan.prices.find((p) => p.currency === currency);
//     if (!priceObj)
//       return res.badRequest({ status: 400, message: "Currency not supported" });

//     const options = {
//       amount: priceObj.amount * 100,
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     // Save transaction as created
//     const transaction = new TransactionModel({
//       name: "Subscription",
//       userId,
//       planId,
//       razorpayOrderId: order.id,
//       amount: priceObj.amount * 100,
//       currency: currency,
//       status: "created",
//     });
//     await transaction.save();

//     res.ok({
//       status: 200,
//       data: {
//         order_id: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         name: "Gemora Studio",
//         description: plan.description,
//         // plan,
//       },
//       message: "Payment created Successfully",
//     });
//   } catch (error) {
//     console.log("🚀 - createOrder - error:", error);
//     return res.failureResponse();
//   }
// };

export const createSubscription = async (req, res) => {
  try {
    const { planId, currency } = req.body;
    const userId = req.userId;

    // Fetch plan
    const plan = await PlanModel.findOne({ planId });
    if (!plan) {
      return res.badRequest({ status: 400, message: "Plan not found" });
    }

    // Match currency
    const priceObj = plan.prices.find((p) => p.currency === currency);
    if (!priceObj) {
      return res.badRequest({ status: 400, message: "Currency not supported" });
    }

    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.planId,
      customer_notify: 1, // Razorpay will notify user
      total_count: 12, // 12 billing cycles (1 year if plan is monthly)
      notes: {
        userId: userId.toString(),
        appPlanId: plan._id.toString(),
      },
    });

    // Save initial transaction in DB
    const transaction = new TransactionModel({
      name: "Subscription",
      userId,
      planId,
      razorpaySubscriptionId: subscription.id,
      amount: priceObj.amount * 100, // amount in paise
      currency,
      status: subscription.status, // should be "created"
    });
    await transaction.save();

    // Response to frontend
    return res.ok({
      status: 200,
      data: {
        subscription_id: subscription.id,
        plan: {
          name: plan.name,
          description: plan.description,
        },
        currency,
        amount: priceObj.amount,
      },
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.log("🚀 - createSubscription - error:", error);
    return res.failureResponse();
  }
};

// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       userId,
//       planId,
//     } = req.body;

//     const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
//     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generatedSignature = hmac.digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       // update transaction as failed
//       await Transaction.findOneAndUpdate(
//         { razorpayOrderId: razorpay_order_id },
//         {
//           razorpayPaymentId: razorpay_payment_id,
//           razorpaySignature: razorpay_signature,
//           status: "failed",
//         }
//       );
//       return res.badRequest({
//         status: 400,
//         success: false,
//         message: "Invalid signature",
//       });
//     }

//     // Payment verified, update user plan
//     const plan = await PlanModel.findById(planId);
//     const user = await UserModel.findById(userId);

//     if (!plan || !user)
//       return res.badRequest({ status: 400, message: "User or Plan not found" });

//     const startDate = new Date();
//     const endDate = new Date();
//     endDate.setDate(endDate.getDate() + (plan.durationInDays || 30));

//     user.activePlans = {
//       planId: plan._id,
//       orderId: razorpay_order_id,
//       paymentId: razorpay_payment_id,
//       startDate,
//       endDate,
//       features: plan.features,
//     };

//     await user.save();

//     // update transaction as paid
//     await TransactionModel.findOneAndUpdate(
//       { razorpayOrderId: razorpay_order_id },
//       {
//         razorpayPaymentId: razorpay_payment_id,
//         razorpaySignature: razorpay_signature,
//         status: "paid",
//       }
//     );

//     res.ok({
//       status: 200,
//       message: "Payment verified & plan activated",
//       data: user,
//     });
//   } catch (error) {
//     console.log("🚀 - verifyPayment - error:", error);
//     return res.failureResponse();
//   }
// };
