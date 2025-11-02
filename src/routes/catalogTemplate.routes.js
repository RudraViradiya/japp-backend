import express from "express";
import tokenValidator from "../middleware/tokenValidator.js";
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  duplicateTemplate,
  deleteTemplate,
} from "../controller/catalogTemplate.controller.js";

const router = express.Router();

// Get all templates (base + user templates if authenticated)
// No auth required - returns base templates only if not authenticated
router.get("/", getAllTemplates);

// Get single template by templateId
router.get("/:templateId", getTemplateById);

// Create new template (requires auth)
router.post("/", tokenValidator, createTemplate);

// Update template (requires auth, only user's templates)
router.put("/:templateId", tokenValidator, updateTemplate);

// Duplicate template (requires auth)
router.post("/:templateId/duplicate", tokenValidator, duplicateTemplate);

// Delete template (requires auth, only user's templates)
router.delete("/:templateId", tokenValidator, deleteTemplate);

export default router;

