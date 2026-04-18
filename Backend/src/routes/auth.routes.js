import express from "express";
import {
  signup,
  verifyOTP,
  login,
  resendOTP,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup",     signup);
router.post("/verify-otp", verifyOTP);
router.post("/login",      login);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
export default router;