import express from "express"
import {
  initiatePayment,
  confirmPayment,
  failPayment,
  getMyPayments,
  getPaymentByBooking
} from "../controllers/payment.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

// Initiate payment after booking     POST /api/payments/initiate
router.post("/initiate",              verifyToken, initiatePayment)

// Confirm payment (player paid)      PUT  /api/payments/:paymentId/confirm
router.put("/:paymentId/confirm",     verifyToken, confirmPayment)

// Fail payment (player cancelled)    PUT  /api/payments/:paymentId/fail
router.put("/:paymentId/fail",        verifyToken, failPayment)

// Get my payment history             GET  /api/payments/my
router.get("/my",                     verifyToken, getMyPayments)

// Get payment by booking             GET  /api/payments/booking/:bookingId
router.get("/booking/:bookingId",     verifyToken, getPaymentByBooking)

export default router