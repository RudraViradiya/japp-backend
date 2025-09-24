import PlanModel from "../model/plan.model.js";

// Fetch all active plans
export const getPlans = async (req, res) => {
  try {
    const plans = await PlanModel.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch single plan by ID
export const getPlanById = async (req, res) => {
  try {
    const plan = await PlanModel.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
