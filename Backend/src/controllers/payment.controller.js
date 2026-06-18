import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// ============================================
// 💳 INITIATE PAYMENT
// Called when player clicks "Pay Now"
// Creates a PENDING payment record
// ============================================
export const initiatePayment = async (req, res) => {
  try {
    const { bookingId, method } = req.body
    const userId = req.user.id

    // 1. Check booking exists and belongs to this user
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

    // 2. Check if payment already exists for this booking
    if (booking.payment) {
      return res.status(400).json({ success: false, message: "Payment already exists for this booking" })
    }

    // 3. Create PENDING payment
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        paymentStatus: "PENDING",
        method: method || "Cash",  // JazzCash, EasyPaisa, Cash
      }
    })

    res.status(201).json({
      success: true,
      message: "Payment initiated",
      payment
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// ✅ CONFIRM PAYMENT
// Called after player completes payment
// Updates payment to SUCCESS
// Updates booking to CONFIRMED
// ============================================
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params
    const { transactionId } = req.body  // optional: from payment gateway
    const userId = req.user.id

    // 1. Find payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true }
    })

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" })
    }

    if (payment.booking.userId !== userId) {
      return res.status(403).json({ success: false, message: "Not your payment" })
    }

    if (payment.paymentStatus === "SUCCESS") {
      return res.status(400).json({ success: false, message: "Payment already confirmed" })
    }

    // 2. Update payment to SUCCESS
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: "SUCCESS",
        transactionId: transactionId || `TXN-${Date.now()}`,// auto-generate if not provided
        paidAt: new Date()
      }
    })

    // 3. Update booking status to CONFIRMED
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" }
    })

    // 4. Send notification to player
    await prisma.notification.create({
      data: {
        userId: payment.booking.userId,
        title: "Payment Successful ✅",
        message: `Your payment of Rs ${payment.amount} has been confirmed.`,
        type: "PAYMENT"
      }
    })

    res.status(200).json({
      success: true,
      message: "Payment confirmed! Booking is now CONFIRMED.",
      payment: updatedPayment
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// ❌ FAIL PAYMENT
// Called if payment fails or player cancels
// ============================================
export const failPayment = async (req, res) => {
  try {
    const { paymentId } = req.params
    const userId = req.user.id

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true }
    })

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" })
    }

    if (payment.booking.userId !== userId) {
      return res.status(403).json({ success: false, message: "Not your payment" })
    }

    // Update payment to FAILED
    await prisma.payment.update({
      where: { id: paymentId },
      data: { paymentStatus: "FAILED" }
    })

    // Update booking back to PENDING
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "PENDING" }
    })

    res.status(200).json({
      success: true,
      message: "Payment marked as failed"
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 💰 GET MY PAYMENTS
// Player sees their own payment history
// ============================================
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id

    const payments = await prisma.payment.findMany({
      where: {
        booking: { userId }
      },
      include: {
        booking: {
          include: {
            ground: { select: { name: true, city: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    res.status(200).json({ success: true, payments })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 🔍 GET SINGLE PAYMENT
// ============================================
export const getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params

    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            ground: { select: { name: true, city: true, pricePerHour: true } },
            user:   { select: { name: true, email: true } }
          }
        }
      }
    })

    if (!payment) {
      return res.status(404).json({ success: false, message: "No payment found for this booking" })
    }

    res.status(200).json({ success: true, payment })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}