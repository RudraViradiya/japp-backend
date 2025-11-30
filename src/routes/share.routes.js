import express from "express";

import { getByIdEmbedLink } from "../controller/model.controller.js";

const router = express.Router();

router.get("/:id", getByIdEmbedLink);

export default router;
