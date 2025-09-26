import crypto from "crypto";
import TransactionModel from "../model/transaction.model.js";
import SubscriptionModel from "../model/subscription.model.js";
import PlanModel from "../model/plan.model.js";
import UserModel from "../model/user.model.js";
import axios from "axios";
import { EMPTY_PLAN } from "../seeders/plans/subscription.js";
import { start } from "repl";

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // Verify signature
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;
    console.log("🚀 - razorpayWebhook - payload:", {
      event,
      payload: JSON.stringify(payload),
    });

    switch (event) {
      case "payment.captured": {
        const orderId = payload.order_id;

        await TransactionModel.findOneAndUpdate(
          { orderId },
          { status: "success", payload },
          { new: true }
        );

        const plan = await PlanModel.findOne({ planId: payload.notes.planId });

        const user = await UserModel.findById(payload.notes.userId);

        if (user.activePlans.length > 1) {
          const newConfig = [user.config, plan.features]
            .sort((a, b) => a.weight - b.weight)
            .reduce((acc, curr) => {
              if (!acc) return curr;
              curr.modelCredit += acc?.modelCredit || 0;
              return curr;
            }, undefined);

          await UserModel.findByIdAndUpdate(payload.notes.userId, {
            $push: {
              activePlans: {
                ...plan,
                startDate: null,
                endDate: null,
                status: "active",
              },
            },
            $set: { config: newConfig },
          });
        } else {
          await UserModel.findByIdAndUpdate(payload.notes.userId, {
            $push: {
              activePlans: {
                ...plan,
                startDate: null,
                endDate: null,
                status: "active",
              },
            },
            $set: { config: plan.features },
          });
        }
      }

      default: {
        console.log("Unhandled webhook event:", event);
      }
    }
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

//! SUBSCRIPTION WEBHOOK
// export const razorpayWebhook = async (req, res) => {
//   try {
//     const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
//     const signature = req.headers["x-razorpay-signature"];

//     // Verify signature
//     const body = JSON.stringify(req.body);
//     const expectedSignature = crypto
//       .createHmac("sha256", secret)
//       .update(body)
//       .digest("hex");

//     if (signature !== expectedSignature) {
//       return res.status(400).json({ error: "Invalid signature" });
//     }

//     const event = req.body.event;
//     const payload = req.body.payload;
//     console.log("🚀 - razorpayWebhook - payload:", {
//       event,
//       payload: JSON.stringify(payload),
//     });

//     switch (event) {
//       case "subscription.activated": {
//         console.log("🚀 - razorpayWebhook - subscription.activated: START");
//         const sub = payload.subscription.entity;
//         const userId = sub.notes.userId;

//         // 1️⃣ Check for existing active subscription
//         const existingSub = await SubscriptionModel.findOne({
//           userId,
//           status: "active",
//           planId: { $ne: sub.plan_id },
//         });

//         console.log("🚀 - razorpayWebhook - existingSub:", existingSub);
//         if (existingSub) {
//           // Cancel existing subscription in Razorpay
//           const razorpayAuth = Buffer.from(
//             `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
//           ).toString("base64");

//           await axios.post(
//             `https://api.razorpay.com/v1/subscriptions/${existingSub.razorpaySubscriptionId}/cancel`,
//             {},
//             { headers: { Authorization: `Basic ${razorpayAuth}` } }
//           );

//           // Update existing subscription status
//           await SubscriptionModel.findByIdAndUpdate(existingSub._id, {
//             status: "cancelled",
//           });

//           // Remove from user's active plans
//           await UserModel.updateOne(
//             { _id: userId },
//             {
//               $pull: {
//                 activePlans: {
//                   razorpaySubscriptionId: existingSub.razorpaySubscriptionId,
//                 },
//               },
//             }
//           );
//         }

//         const plan = await PlanModel.findOne({ planId: sub.plan_id });
//         console.log("🚀 - razorpayWebhook - plan:", plan);

//         // 2️⃣ Add to user's active plans
//         await UserModel.findByIdAndUpdate(
//           userId,
//           {
//             $push: {
//               activePlans: {
//                 planId: plan.planId,
//                 name: plan.name,
//                 description: plan.description,
//                 weight: plan.weight,
//                 type: plan.type,
//                 features: plan.features,
//                 prices: plan.prices,
//                 durationInDays: plan.durationInDays,
//                 startDate: new Date(),
//                 endDate: new Date(sub.current_end * 1000),
//                 razorpaySubscriptionId: sub.id,
//                 status: "active",
//               },
//             },
//           },
//           { new: true }
//         );
//         console.log("🚀 - razorpayWebhook - subscription.activated: END");

//         break;
//       }

//       case "subscription.charged": {
//         console.log("🚀 - razorpayWebhook - subscription.charged: START");

//         const sub = payload.subscription.entity;
//         const payment = payload.payment.entity;

//         await TransactionModel.create({
//           name: "Subscription Charged",
//           userId: sub.notes.userId,
//           planId: sub.notes.appPlanId,
//           razorpaySubscriptionId: sub.id,
//           razorpayPaymentId: payment.id,
//           amount: payment.amount,
//           currency: payment.currency,
//           status: payment.status,
//         });

//         // mark subscription active in DB
//         await SubscriptionModel.findOneAndUpdate(
//           { razorpaySubscriptionId: sub.id },
//           {
//             status: "active",
//             cycleCount: sub.paid_count || 1,
//             nextBillingDate: new Date(sub.current_end * 1000),
//           },
//           { upsert: true }
//         );

//         // 3️⃣ Fetch plan details
//         const plan = await PlanModel.findOne({ planId: sub.plan_id });

//         if (plan && plan.features) {
//           // 4️⃣ Update user config from plan features
//           await UserModel.findByIdAndUpdate(sub.notes.userId, {
//             $set: { config: plan.features },
//           });
//         }
//         console.log("🚀 - razorpayWebhook - subscription.charged: END");
//         break;
//       }

//       case "subscription.cancelled":
//       case "subscription.halted": {
//         console.log("🚀 - razorpayWebhook - subscription.cancelled: START");

//         const sub = payload.subscription.entity;

//         // 1️⃣ Update subscription status

//         await SubscriptionModel.findOneAndUpdate(
//           { razorpaySubscriptionId: sub.id },
//           { status: "cancelled" }
//         );

//         // 2️⃣ Remove plan from user's activePlans
//         await UserModel.updateOne(
//           { _id: sub.notes.userId },
//           {
//             $pull: { activePlans: { razorpaySubscriptionId: sub.id } },
//             $set: { config: EMPTY_PLAN.features },
//           }
//         );

//         // 3️⃣ If halted (blocked), cancel subscription in Razorpay
//         if (event === "subscription.halted") {
//           const razorpayAuth = Buffer.from(
//             `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
//           ).toString("base64");

//           await axios.post(
//             `https://api.razorpay.com/v1/subscriptions/${sub.id}/cancel`,
//             {},
//             { headers: { Authorization: `Basic ${razorpayAuth}` } }
//           );
//         }
//         console.log("🚀 - razorpayWebhook - subscription.cancelled: END");

//         break;
//       }

//       case "payment.failed": {
//         console.log("🚀 - razorpayWebhook - subscription.failed: START");

//         const payment = payload.payment.entity;
//         await TransactionModel.findOneAndUpdate(
//           { razorpayPaymentId: payment.id },
//           { status: "failed" }
//         );
//         console.log("🚀 - razorpayWebhook - subscription.failed: END");

//         break;
//       }

//       default:
//         console.log("Unhandled webhook event:", event);
//     }

//     res.json({ status: "ok" });
//   } catch (error) {
//     console.error("Webhook Error:", error);
//     res.status(500).json({ error: "Webhook handler failed" });
//   }
// };
