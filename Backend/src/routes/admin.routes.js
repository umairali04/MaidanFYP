import express from 'express'
import {
  adminLogin,
  getAdminStats,
  getAllUsers,
  getAllGrounds,
  getAllBookings,
  getAllPayments,
  getAllDisputes,
  updateDisputeStatus
} from '../controllers/admin.controller.js'

import { verifyToken } from "../middleware/auth.middleware.js"
import { isAdmin } from "../middleware/isAdmin.middleware.js"

const router = express.Router()

// ============================================
// 🔐 ADMIN LOGIN
// ============================================

router.post('/login', adminLogin)


// ============================================
// 🔒 PROTECTED ADMIN ROUTES
// ============================================

router.get('/dashboard', verifyToken, isAdmin, getAdminStats)

router.get('/users', verifyToken, isAdmin, getAllUsers)

router.get('/grounds', verifyToken, isAdmin, getAllGrounds)

router.get('/bookings', verifyToken, isAdmin, getAllBookings)

router.get('/payments', verifyToken, isAdmin, getAllPayments)

// DISPUTES
router.get('/disputes', verifyToken, isAdmin, getAllDisputes)

router.put('/disputes/:id', verifyToken, isAdmin, updateDisputeStatus)

export default router