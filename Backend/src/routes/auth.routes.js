import express from "express";
import {
  signup,
  verifyOTP,
  login,
  resendOTP,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword
} from "../controllers/auth.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup",     signup);
router.post("/verify-otp", verifyOTP);
router.post("/login",      login);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ============================================
// PROTECTED ROUTES (need token)
// ============================================
router.get("/me", verifyToken, getMe);
router.put("/update-profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

export default router;