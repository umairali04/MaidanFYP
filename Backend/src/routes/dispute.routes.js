import express from "express"
import { verifyToken } from "../middleware/auth.middleware.js"
import prisma from "../utils/prisma.js"

const router = express.Router()

// Player submits dispute   POST /api/disputes
router.post("/", verifyToken, async (req, res) => {
  try {
    const { groundId, bookingId, title, description } = req.body

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" })
    }

    const dispute = await prisma.dispute.create({
      data: {
        userId:      req.user.id,
        groundId:    groundId    || null,
        bookingId:   bookingId   || null,
        title,
        description
      }
    })

    res.status(201).json({ success: true, dispute })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router