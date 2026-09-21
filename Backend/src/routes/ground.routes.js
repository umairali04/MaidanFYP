import express from "express";

import {
  getAllGrounds,
  getGroundById,
  createGround,
} from "../controllers/ground.controller.js";

import {
  getGroundAnalytics,
} from "../controllers/groundAnalytics.controller.js";

import {
  verifyToken,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  getAllGrounds
);

// Analytics route MUST come before /:id
router.get(
  "/:id/analytics",
  getGroundAnalytics
);

router.get(
  "/:id",
  getGroundById
);

router.post(
  "/",
  verifyToken,
  createGround
);

export default router;