import express from "express"
import {
  initiatePayment,
  confirmPayment,
  failPayment,
  getMyPayments,
  getPaymentByBooking,
  stripeWebhook,
  initiateStripeCheckout
} from "../controllers/payment.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

// Initiate payment after booking     POST /api/payments/initiate
router.post("/initiate",              verifyToken, initiatePayment)

// Initiate Stripe checkout (Card)    POST /api/payments/initiate-card
router.post("/initiate-card",         verifyToken, initiateStripeCheckout)

// Confirm payment (manual methods)   PUT  /api/payments/:paymentId/confirm
router.put("/:paymentId/confirm",     verifyToken, confirmPayment)

// Fail payment (player cancelled)    PUT  /api/payments/:paymentId/fail
router.put("/:paymentId/fail",        verifyToken, failPayment)

// Get my payment history             GET  /api/payments/my
router.get("/my",                     verifyToken, getMyPayments)

// Get payment by booking             GET  /api/payments/booking/:bookingId
router.get("/booking/:bookingId",     verifyToken, getPaymentByBooking)

// Stripe webhook - Stripe calls this directly, no auth, raw body
// (raw parsing is applied in server.js BEFORE this router is mounted)
router.post("/webhook", stripeWebhook)

export default router