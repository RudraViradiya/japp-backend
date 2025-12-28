import express from "express";
import {
  getAllPlans,
  getAllUsers,
  getUsersList,
  getAllStatistics,
  getUserById,
  removeActivePlan,
  updateUserById,
  upgradePlan,
  getUserCreatedLogs,
  getUserActivatedLogs,
  getAllMaterials,
  addMaterial,
  editMaterial,
  deleteMaterial,
  getAllModels,
} from "../controller/admin.controller.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/getAllUsers", getAllUsers);

router.get("/getUsersList", getUsersList);

router.get("/getAllStatistics", getAllStatistics);

router.get("/getUserCreatedLogs", getUserCreatedLogs);

router.get("/getUserActivatedLogs", getUserActivatedLogs);

router.get("/getUsersById/:id", getUserById);

router.put("/updateUser/:id", updateUserById);

router.get("/getAllPlans", getAllPlans);

router.post("/upgradePlan", upgradePlan);

router.delete("/deletePlan/:userId/:planId", removeActivePlan);

router.get("/getAllMaterials", getAllMaterials);

router.get("/getAllModels", getAllModels);

router.post(
  "/addMaterial",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  addMaterial
);

router.put(
  "/updateMaterial/:id",
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  editMaterial
);

router.delete("/deleteMaterial/:id", deleteMaterial);

export default router;
