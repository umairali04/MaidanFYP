import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// ============================================
// 📅 CREATE BOOKING
// Status starts as PENDING (not CONFIRMED)
// Becomes CONFIRMED only after payment
// ============================================
export const createBooking = async (req, res) => {
  try {
    const { groundId, bookingDate, startTime, endTime, duration, totalPrice, notes } = req.body;
    const userId = req.user.id;

    const bookingDay = new Date(`${bookingDate}T00:00:00`);

    const existingBookings = await prisma.booking.findMany({
      where: {
        groundId,
        bookingDate: bookingDay,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    const newStart = startTime.slice(0, 5);
    const newEnd = endTime.slice(0, 5);

    const toMinutes = (time) => {
      const [hours, minutes] = String(time).split(":").map(Number);
      return hours * 60 + minutes;
    };

    const newStartMinutes = toMinutes(newStart);
    const newEndMinutes = toMinutes(newEnd);

    const conflictingBooking = existingBookings.find((existing) => {
      const existingStart = toMinutes(existing.startTime);
      const existingEnd = toMinutes(existing.endTime);

      return newStartMinutes < existingEnd && newEndMinutes > existingStart;
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: `This slot is already booked (${conflictingBooking.startTime}–${conflictingBooking.endTime})`,
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        groundId,
        bookingDate: bookingDay,
        startTime,
        endTime,
        duration: Number(duration),
        totalPrice: Number(totalPrice),
        status: "PENDING",
        notes: notes || null,
      },
      include: {
        ground: {
          select: {
            name: true,
            location: true,
            city: true,
            pricePerHour: true,
          },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Booking Created ⏳",
        message: `Your booking for ${booking.ground.name} is pending payment.`,
        type: "BOOKING",
      },
    });

    res.status(201).json({
      success: true,
      message: "Booking created. Please complete payment to confirm.",
      booking,
    });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

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

// ============================================
// GET OWNER BOOKINGS
// ============================================

export const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: {
        ground: {
          ownerId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ground: {
          select: {
            id: true,
            name: true,
            city: true,
            sportType: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================
// Update owner BOOKINGS
// ============================================
export const updateBookingStatus = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
      include: {
        ground: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.ground.ownerId !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updated = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    res.json({
      success: true,
      booking: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
