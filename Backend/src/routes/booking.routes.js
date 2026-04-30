import express from "express"
import { createBooking, getUserBookings } from "../controllers/booking.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/",        verifyToken, createBooking)    // POST /api/bookings
router.get("/my",       verifyToken, getUserBookings)  // GET  /api/bookings/my

export default router