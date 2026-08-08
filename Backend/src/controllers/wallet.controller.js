import prisma from "../utils/prisma.js"

export const getWallet = async (req, res) => {
  const userId = req.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      walletBalance: true,
      walletTransactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  res.json({
    balance: user.walletBalance,
    transactions: user.walletTransactions,
  })
}

export const addMoney = async (req, res) => {
  const userId = req.user.id
  const { amount, method } = req.body

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" })
  }

  const result = await prisma.$transaction(async tx => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          increment: amount,
        },
      },
    })

    await tx.walletTransaction.create({
      data: {
        userId,
        amount,
        type: "ADD_MONEY",
        note: `Money added via ${method || "Wallet Top-up"}`,
      },
    })

    return user
  })

  res.json({
    message: "Money added successfully",
    balance: result.walletBalance,
  })
}

export const getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user.id

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(transactions)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Failed to fetch wallet transactions",
    })
  }
}

export const payBookingFromWallet = async (req, res) => {
  try {
    const userId = req.user.id
    const { bookingId } = req.body

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
      },
    })

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (user.walletBalance < booking.totalPrice) {
      return res.status(400).json({
        message: "Insufficient wallet balance",
      })
    }

    await prisma.$transaction(async (tx) => {

      // Deduct wallet amount
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            decrement: booking.totalPrice,
          },
        },
      })

      // Transaction history
      await tx.walletTransaction.create({
        data: {
          userId,
          amount: booking.totalPrice,
          type: "BOOKING_PAYMENT",
          note: `Payment for booking ${booking.id}`,
        },
      })

      // Create payment record if none exists
      let paymentId

      if (!booking.payment) {
        const payment = await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: booking.totalPrice,
            paymentStatus: "SUCCESS",
            method: "Wallet",
            paidAt: new Date(),
            transactionId: `WALLET-${Date.now()}`
          },
        })

        paymentId = payment.id
      } else {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            paymentStatus: "SUCCESS",
            method: "Wallet",
            paidAt: new Date(),
            transactionId: `WALLET-${Date.now()}`
          },
        })

        paymentId = booking.payment.id
      }

      // Confirm booking
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "CONFIRMED",
        },
      })
    })

    res.json({
      message: "Booking paid successfully using wallet",
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Wallet payment failed",
    })
  }
}