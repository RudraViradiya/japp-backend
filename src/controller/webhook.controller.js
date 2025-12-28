import crypto from "crypto";
import TransactionModel from "../model/transaction.model.js";
import SubscriptionModel from "../model/subscription.model.js";
import PlanModel from "../model/plan.model.js";
import UserModel from "../model/user.model.js";
import axios from "axios";
import { EMPTY_PLAN } from "../seeders/plans/subscription.js";
import { start } from "repl";
import LogModel from "../model/logs.model.js";
import TopUpModel from "../model/topUp.model.js";
import e from "express";
import { addDays } from "date-fns";

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
        const planType = payload.notes.type;
        const userId = payload.notes.userId;

        await TransactionModel.findOneAndUpdate(
          { orderId },
          { status: "success", payload },
          { new: true }
        );
        await LogModel.create({
          userId,
          type: "PLAN_PURCHASED",
          note: "New Plan purchased",
          data: payload,
        });

        const config = payload.notes;
        const planId = config.planId;

        const user = await UserModel.findById(userId);

        if (planType === "MAIN_PLAN") {
          const plan = await PlanModel.findOne({ planId });

          const unlimitedPlanIndex = user.activePlans.findIndex(
            (e) => e.type === "UNLIMITED"
          );

          const isUnlimitedPlan = plan.type === "UNLIMITED";

          let startDate = new Date();
          let endDate = null;

          let newConfig = plan.features;

          if (unlimitedPlanIndex !== -1 && isUnlimitedPlan) {
            // if (plan.durationInDays) {
            //   endDate = addDays(
            //     new Date(user.activePlans[unlimitedPlanIndex].endDate),
            //     plan.durationInDays
            //   );
            // }
            // user.activePlans[unlimitedPlanIndex].endDate = endDate;
            // user.config = newConfig;
            // user.markModified("activePlans");
            // await user.save();
          } else {
            if (plan.durationInDays) {
              endDate = addDays(startDate, plan.durationInDays);
            }

            if (newConfig.modelCredit) {
              newConfig.modelCredit += user.config.modelCredit || 0;
            }
            if (newConfig.imageCredit) {
              newConfig.imageCredit += user.config.imageCredit || 0;
            }
            if (newConfig.videoCredit) {
              newConfig.videoCredit += user.config.videoCredit || 0;
            }
            if (newConfig.aiImageCredit) {
              newConfig.aiImageCredit += user.config.aiImageCredit || 0;
            }

            const previousPlans = user.activePlans.filter(
              (p) => p.planId === "FREE_PLAN"
            );

            const activePlans = [
              ...previousPlans,
              { ...plan.toObject(), status: "active", startDate, endDate },
            ];

            user.activePlans = activePlans;
            user.config = newConfig;
            await user.save();
          }
        } else {
          const plan = await TopUpModel.findOne({ planId });
          // const key = config.planType;
          // const count = +config.planCount;

          await TransactionModel.findOneAndUpdate(
            { orderId },
            { status: "success", payload },
            { new: true }
          );

          const type = plan.type;
          const count = plan?.features?.[type] || 0;
          const isLimitedPlan = plan.type === "storageLimit";

          if (isLimitedPlan) {
            let startDate = new Date();
            let endDate = null;

            if (plan.durationInDays) {
              endDate = addDays(startDate, plan.durationInDays);
            }

            user.activeTopUps.push({
              ...(plan.toObject?.() ?? plan),
              status: "active",
              startDate,
              endDate,
            });
            user.markModified("activeTopUps");
          }

          if (count > 0) {
            user.config[type] = (user.config[type] || 0) + count;
            user.markModified("config");
          }

          console.log("🚀 - razorpayWebhook - user:", user);
          await user.save();
          // await UserModel.updateOne(
          //   { _id: userId },
          //   { $inc: { [`config.${type}`]: count } }
          // );
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
