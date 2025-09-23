// controller/webhook.js
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body.event;

    if (event === "subscription.charged") {
      const { plan_id, notes } = req.body.payload.subscription.entity;
      const userId = notes.userId;

      // Reset credits according to plan
      const plan = await PlanModel.findOne({ razorpayPlanId: plan_id });
      await UserModel.findByIdAndUpdate(userId, {
        ...plan.features,
        activePlan: plan._id,
      });
    }

    if (event === "subscription.cancelled") {
      const { notes } = req.body.payload.subscription.entity;
      const userId = notes.userId;

      // Remove plan & permissions
      await UserModel.findByIdAndUpdate(userId, {
        activePlan: null,
        modelCredit: 0,
        aiImageCredit: 0,
        // disable other flags
      });
    }

    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
