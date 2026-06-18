import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// ============================================
// 📅 CREATE BOOKING
// Status starts as PENDING (not CONFIRMED)
// Becomes CONFIRMED only after payment
// ============================================
export const createBooking = async (req, res) => {
  try {
    const { groundId, bookingDate, startTime, endTime, duration, totalPrice, notes } = req.body
    const userId = req.user.id

    // 1. Check if slot already booked
    const existing = await prisma.booking.findFirst({
      where: {
        groundId,
        bookingDate: new Date(bookingDate),
        startTime,
        status: { in: ["PENDING", "CONFIRMED"] } // ignore cancelled
      }
    })

    if (existing) {
      return res.status(400).json({ success: false, message: "This slot is already booked" })
    }

    // 2. Create booking with PENDING status
    // ⚠️ Status is PENDING until payment is completed
    const booking = await prisma.booking.create({
      data: {
        userId,
        groundId,
        bookingDate:  new Date(bookingDate),
        startTime,
        endTime,
        duration:     Number(duration),
        totalPrice:   Number(totalPrice),
        status:       "PENDING",   // ← PENDING until paid
        notes:        notes || null
      },
      include: {
        ground: { select: { name: true, location: true, city: true, pricePerHour: true } }
      }
    })

    // 3. Send notification to player
    await prisma.notification.create({
      data: {
        userId,
        title: "Booking Created ⏳",
        message: `Your booking for ${booking.ground.name} is pending payment.`,
        type: "BOOKING"
      }
    })

    res.status(201).json({
      success: true,
      message: "Booking created. Please complete payment to confirm.",
      booking
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 📋 GET MY BOOKINGS
// ============================================
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where:   { userId: req.user.id },
      include: {
        ground:  { select: { name: true, location: true, city: true, images: true } },
        payment: true   // ← include payment status so frontend shows "Pay Now" or "Paid"
      },
      orderBy: { createdAt: "desc" }
    })

    res.json({ success: true, bookings })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// ❌ CANCEL BOOKING
// ============================================
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params
    const userId = req.user.id

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true }
    })

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ success: false, message: "Not your booking" })
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Already cancelled" })
    }

    // Cancel booking
    await prisma.booking.update({
      where: { id: bookingId },
      data:  { status: "CANCELLED" }
    })

    // If payment was SUCCESS → mark as REFUNDED
    if (booking.payment?.paymentStatus === "SUCCESS") {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data:  { paymentStatus: "REFUNDED" }
      })

      await prisma.notification.create({
        data: {
          userId,
          title: "Booking Cancelled - Refund Initiated 💸",
          message: `Your booking has been cancelled. Refund of Rs ${booking.totalPrice} will be processed.`,
          type: "PAYMENT"
        }
      })
    }

    res.json({ success: true, message: "Booking cancelled successfully" })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}