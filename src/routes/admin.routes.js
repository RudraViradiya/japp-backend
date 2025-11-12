import express from "express";
import {
  getAllPlans,
  getAllUsers,
  getAllStatistics,
  getUserById,
  removeActivePlan,
  updateUserById,
  upgradePlan,
  getUserCreatedLogs,
  getUserActivatedLogs,
} from "../controller/admin.controller.js";

const router = express.Router();

router.get("/getAllUsers", getAllUsers);

router.get("/getAllStatistics", getAllStatistics);

router.get("/getUserCreatedLogs", getUserCreatedLogs);

router.get("/getUserActivatedLogs", getUserActivatedLogs);

router.get("/getUsersById/:id", getUserById);

router.put("/updateUser/:id", updateUserById);

router.get("/getAllPlans", getAllPlans);

router.post("/upgradePlan", upgradePlan);

router.delete("/deletePlan/:userId/:planId", removeActivePlan);

export default router;
