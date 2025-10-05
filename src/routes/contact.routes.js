import express from "express";
import {
  createContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from "../controller/contact.controller.js";

const router = express.Router();

// Public route - anyone can submit contact form
router.post("/", createContact);

// Protected routes - require authentication for admin management
router.get("/", getContacts);
router.get("/:id", getContactById);
router.patch("/:id/status", updateContactStatus);
router.delete("/:id", deleteContact);

export default router;
