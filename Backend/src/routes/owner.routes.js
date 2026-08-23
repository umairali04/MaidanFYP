// routes/owner.routes.js

import express from 'express'
import {
  getOwnerStats,
  getOwnerGrounds,
  getOwnerGroundById,
  updateOwnerGround,
  getOwnerProfile,
  updateOwnerProfile,
  updateOwnerPassword,
} from '../controllers/owner.controller.js'

import {
  getOwnerBookings,
  updateBookingStatus,
} from "../controllers/booking.controller.js";

import { verifyToken } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Stats
router.get('/stats', verifyToken, getOwnerStats)

// Owner's own grounds (only their grounds, auth protected)
router.get('/grounds',         verifyToken, getOwnerGrounds)
router.get('/grounds/:id',     verifyToken, getOwnerGroundById)
router.put('/grounds/:id',     verifyToken, updateOwnerGround)
router.get("/bookings", verifyToken, getOwnerBookings);
router.patch("/bookings/:id/status",verifyToken, updateBookingStatus);
// Profile
router.get('/profile', verifyToken, getOwnerProfile)
router.put('/profile', verifyToken, upload.single('image'),updateOwnerProfile)
router.put('/profile/password', verifyToken, updateOwnerPassword)

export default router