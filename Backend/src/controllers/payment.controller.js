import { PrismaClient } from "@prisma/client"
  import Stripe from "stripe"

  const prisma = new PrismaClient()
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  // ============================================
  // 💳 INITIATE PAYMENT
  // Called when player clicks "Pay Now"
  // Creates a PENDING payment record
  // If method is Card, also creates a Stripe Checkout session
  // ============================================
  export const initiatePayment = async (req, res) => {
    try {
      const { bookingId, method } = req.body
      const userId = req.user.id

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true, ground: true, user: true }
      })

      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" })
      }

      if (booking.userId !== userId) {
        return res.status(403).json({ success: false, message: "Not your booking" })
      }

      if (booking.payment) {
        return res.status(400).json({ success: false, message: "Payment already exists for this booking" })
      }

      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          paymentStatus: "PENDING",
          method: method || "Cash",
        }
      })

      if (method === "Card") {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          customer_email: booking.user.email,
          line_items: [
            {
              price_data: {
                currency: "pkr",
                product_data: {
                  name: `${booking.ground.name} - ${booking.startTime} to ${booking.endTime}`,
                },
                unit_amount: Math.round(booking.totalPrice * 100),
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${process.env.CLIENT_URL}/bookings?payment=success`,
          cancel_url: `${process.env.CLIENT_URL}/bookings?payment=cancelled`,
          metadata: {
            bookingIds: JSON.stringify([booking.id]),
            paymentIds: JSON.stringify([payment.id]),
          },
        })

        await prisma.payment.update({
          where: { id: payment.id },
          data: { stripeSessionId: session.id },
        })

        return res.status(201).json({
          success: true,
          message: "Stripe checkout session created",
          payment,
          checkoutUrl: session.url,
        })
      }

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
  // 💳 INITIATE STRIPE CHECKOUT (multi-booking)
  // Called when player selects Card and may have multiple slots
  // Creates one Payment per booking, then ONE combined Stripe session
  // ============================================
  export const initiateStripeCheckout = async (req, res) => {
    try {
      const { bookingIds } = req.body
      const userId = req.user.id

      if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
        return res.status(400).json({ success: false, message: "No bookings provided" })
      }

      const bookings = await prisma.booking.findMany({
        where: { id: { in: bookingIds } },
        include: { payment: true, ground: true, user: true }
      })

      if (bookings.length !== bookingIds.length) {
        return res.status(404).json({ success: false, message: "One or more bookings not found" })
      }

      for (const b of bookings) {
        if (b.userId !== userId) {
          return res.status(403).json({ success: false, message: "Not your booking" })
        }
        if (b.payment) {
          return res.status(400).json({ success: false, message: "Payment already exists for one of these bookings" })
        }
      }

      const payments = await Promise.all(
        bookings.map(b =>
          prisma.payment.create({
            data: {
              bookingId: b.id,
              amount: b.totalPrice,
              paymentStatus: "PENDING",
              method: "Card",
            }
          })
        )
      )

      const line_items = bookings.map(b => ({
        price_data: {
          currency: "pkr",
          product_data: {
            name: `${b.ground.name} - ${b.startTime} to ${b.endTime}`,
          },
          unit_amount: Math.round(b.totalPrice * 100),
        },
        quantity: 1,
      }))

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: bookings[0].user.email,
        line_items,
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/bookings?payment=success`,
        cancel_url: `${process.env.CLIENT_URL}/bookings?payment=cancelled`,
        metadata: {
          bookingIds: JSON.stringify(bookings.map(b => b.id)),
          paymentIds: JSON.stringify(payments.map(p => p.id)),
        },
      })

      await prisma.payment.updateMany({
        where: { id: { in: payments.map(p => p.id) } },
        data: { stripeSessionId: session.id },
      })

      res.status(201).json({
        success: true,
        checkoutUrl: session.url,
      })

    } catch (err) {
      res.status(500).json({ success: false, message: err.message })
    }
  }

  // ============================================
  // ✅ CONFIRM PAYMENT
  // Called after player completes payment (manual methods only:
  // Cash, JazzCash, EasyPaisa). Card payments are confirmed
  // automatically by the Stripe webhook below, not this route.
  // ============================================
  export const confirmPayment = async (req, res) => {
    try {
      const { paymentId } = req.params
      const { transactionId } = req.body
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

      if (payment.paymentStatus === "SUCCESS") {
        return res.status(400).json({ success: false, message: "Payment already confirmed" })
      }

      if (payment.method === "Card") {
        return res.status(400).json({
          success: false,
          message: "Card payments are confirmed automatically. Please wait a moment and refresh."
        })
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymentStatus: "SUCCESS",
          transactionId: transactionId || `TXN-${Date.now()}`,
          paidAt: new Date()
        }
      })

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" }
      })

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

      await prisma.payment.update({
        where: { id: paymentId },
        data: { paymentStatus: "FAILED" }
      })

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

  // ============================================
  // 🔔 STRIPE WEBHOOK
  // Called automatically by Stripe when payment succeeds.
  // This route must receive the RAW body (see server.js setup).
  // Handles BOTH single and multi-booking checkouts, since both
  // now store metadata as bookingIds/paymentIds (JSON arrays).
  // ============================================
  export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"]
    let event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error("Webhook signature failed:", err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const bookingIds = JSON.parse(session.metadata.bookingIds)
      const paymentIds = JSON.parse(session.metadata.paymentIds)

      try {
        for (let i = 0; i < paymentIds.length; i++) {
          const payment = await prisma.payment.findUnique({ where: { id: paymentIds[i] } })

          if (payment && payment.paymentStatus !== "SUCCESS") {
            await prisma.payment.update({
              where: { id: paymentIds[i] },
              data: {
                paymentStatus: "SUCCESS",
                transactionId: session.payment_intent,
                paidAt: new Date(),
              }
            })

            const booking = await prisma.booking.update({
              where: { id: bookingIds[i] },
              data: { status: "CONFIRMED" }
            })

            await prisma.notification.create({
              data: {
                userId: booking.userId,
                title: "Payment Successful ✅",
                message: `Your payment of Rs ${payment.amount} has been confirmed.`,
                type: "PAYMENT"
              }
            })
          }
        }

        console.log(`Bookings ${bookingIds.join(', ')} confirmed via Stripe webhook`)
      } catch (err) {
        console.error("Error processing webhook:", err.message)
      }
    }

    res.json({ received: true })
  }