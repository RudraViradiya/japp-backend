import express from "express";
import {
  getAllPlans,
  getAllUsers,
  getUserById,
  removeActivePlan,
  updateUserById,
  upgradePlan,
} from "../controller/admin.controller.js";

const router = express.Router();

router.get("/getAllUsers", getAllUsers);

router.get("/getUsersById/:id", getUserById);

router.put("/updateUser/:id", updateUserById);

router.get("/getAllPlans", getAllPlans);

router.post("/upgradePlan", upgradePlan);

router.delete("/deletePlan/:userId/:planId", removeActivePlan);

export default router;
