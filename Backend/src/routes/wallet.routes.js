import express from "express"
import {
  getWallet,
  addMoney,
  getWalletTransactions,
  payBookingFromWallet
} from "../controllers/wallet.controller.js"

import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

// Get user wallet balance + recent transactions
router.get("/", verifyToken, getWallet)

// Add money to wallet
router.post("/add-money", verifyToken, addMoney)

// Get all wallet transactions
router.get("/transactions", verifyToken, getWalletTransactions)

// Pay booking using wallet balance
router.post("/pay-booking", verifyToken, payBookingFromWallet)

export default router