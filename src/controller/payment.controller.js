// controllers/paymentController.js
import Razorpay from "razorpay";
import PlanModel from "../model/plan.model.js";
import SubscriptionModel from "../model/subscription.model.js";
import UserModel from "../model/user.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

    const subscriptionItem = new SubscriptionModel({
      userId: userId.toString(),
      planId: plan.planId,
      razorpaySubscriptionId: subscription.id,
      status: "created",
      startDate: new Date(),
      cycleCount: 0,
    });
    await subscriptionItem.save();

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
        name: "Gemora Studio",
        theme: { color: "#c4a484" },
      },
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.log("🚀 - createSubscription - error:", error);
    return res.failureResponse();
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.userId;

    if (!subscriptionId) {
      return res.badRequest({
        status: 400,
        message: "SubscriptionId required",
      });
    }

    const subscription = await SubscriptionModel.findOne({
      userId,
      razorpaySubscriptionId: subscriptionId,
    });

    if (!subscription) {
      return res.badRequest({
        status: 400,
        message: "Subscription not found",
      });
    }

    // Cancel subscription in Razorpay
    const cancelled = await razorpay.subscriptions.cancel(subscriptionId, true);

    // Update SubscriptionModel in DB
    await SubscriptionModel.findOneAndUpdate(
      { userId, razorpaySubscriptionId: subscriptionId },
      { status: "cancelled", endDate: new Date() }
    );

    await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: { "activePlans.$[elem].status": "cancelled" },
      },
      {
        arrayFilters: [{ "elem.razorpaySubscriptionId": subscriptionId }],
        new: true,
      }
    );

    return res.ok({
      status: 200,
      message: "Subscription cancelled successfully",
      data: cancelled,
    });
  } catch (error) {
    console.error("🚀 - cancelSubscription - error:", error);
    return res.failureResponse(
      error.message || "Failed to cancel subscription"
    );
  }
};
