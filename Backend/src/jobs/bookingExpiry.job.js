import cron from "node-cron";
import prisma from "../utils/prisma.js";

const checkBookingPayments = async () => {
  try {
    const now = new Date();

    // ============================================
    // 🔔 SEND REMINDER AFTER 50 MINUTES
    // ============================================

    const reminderBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        paymentDeadline: { gt: now },
        paymentReminderSentAt: null,
        createdAt: {
          lte: new Date(now.getTime() - 50 * 60 * 1000),
        },
      },
      include: {
        ground: {
          select: {
            name: true,
          },
        },
      },
    });

    for (const booking of reminderBookings) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: "Payment Reminder ⚠️",
          message: `Your payment for ${booking.ground.name} is still pending. Your booking will be automatically reversed in 10 minutes if payment is not completed.`,
          type: "PAYMENT",
        },
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentReminderSentAt: now,
        },
      });

      console.log(`Payment reminder sent for booking ${booking.id}`);
    }

    // ============================================
    // ❌ CANCEL BOOKINGS AFTER 1 HOUR
    // ============================================

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        paymentDeadline: {
          lte: now,
        },
      },
      include: {
        payment: true,
        ground: {
          select: {
            name: true,
          },
        },
      },
    });

    for (const booking of expiredBookings) {
      // Payment was completed
      if (booking.payment?.paymentStatus === "SUCCESS") {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "CONFIRMED" },
        });

        continue;
      }

      // Payment not completed → cancel booking
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });

      // If a pending payment record exists, mark it failed
      if (booking.payment?.paymentStatus === "PENDING") {
        await prisma.payment.update({
          where: { id: booking.payment.id },
          data: { paymentStatus: "FAILED" },
        });
      }

      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: "Booking Reversed ❌",
          message: `Your booking for ${booking.ground.name} was reversed because payment was not completed within 1 hour.`,
          type: "BOOKING",
        },
      });

      console.log(`Booking ${booking.id} automatically reversed`);
    }
  } catch (error) {
    console.error("BOOKING EXPIRY JOB ERROR:", error);
  }
};

// Run every minute
cron.schedule("* * * * *", checkBookingPayments);

console.log("Booking payment expiry job started");