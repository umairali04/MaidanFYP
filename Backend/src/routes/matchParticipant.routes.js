import express from "express"
import {
  inviteToBooking,
  getBookingParticipants,
  getMyPendingInvites,
  respondToInvite
} from "../controllers/matchParticipant.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/:bookingId/invite",        verifyToken, inviteToBooking)        // POST /api/bookings/:bookingId/invite
router.get("/:bookingId/participants",   verifyToken, getBookingParticipants) // GET  /api/bookings/:bookingId/participants
router.get("/participants/mine",         verifyToken, getMyPendingInvites)    // GET  /api/bookings/participants/mine
router.put("/participants/:participantId/respond", verifyToken, respondToInvite) // PUT /api/bookings/participants/:participantId/respond

export default router