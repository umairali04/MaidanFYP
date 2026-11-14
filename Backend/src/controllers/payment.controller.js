import { PrismaClient } from "@prisma/client"
  import Stripe from "stripe"
  import { generateMatchCode } from "../utils/generateMatchCode.js"
  import { sendBookingConfirmationEmail } from "../utils/mailer.js"

  const prisma = new PrismaClient()
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  //strip object is created

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
      
      if (booking.status !== "PENDING") {
        return res.status(400).json({ success: false, message: "This booking is no longer available for payment" })
      }

      if (booking.paymentDeadline && new Date() > booking.paymentDeadline) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED" },
        })

        return res.status(400).json({
          success: false,
          message: "Payment deadline has expired. Your booking has been reversed.",
        })
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
        const session = await stripe.checkout.sessions.create({//ask stripe to create checkout session.
          payment_method_types: ["card"],
          customer_email: booking.user.email,
          line_items: [
            {
              price_data: {
                currency: "pkr",
                product_data: {
                  name: `${booking.ground.name} - ${booking.startTime} to ${booking.endTime}`,
                },
                unit_amount: Math.round(booking.totalPrice * 100), //converts into smallest unit currency
              },
              quantity: 1,
            },
          ],
          mode: "payment", //one time booking, not subscription
          success_url: `${process.env.CLIENT_URL}/bookings?payment=success`,
          cancel_url: `${process.env.CLIENT_URL}/bookings?payment=cancelled`,
          metadata: {
            bookingIds: JSON.stringify([booking.id]),
            paymentIds: JSON.stringify([payment.id]),
            //attaching own db id's to stripe session, later when stripe sends wehbhook, backend can say:
            //which maidan booking/payment does this stripe payment belong to? 
            //That's how your system connects Stripe's payment with your own database.
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

      const payments = await Promise.all( //promise: wait until all payment creation is done
        bookings.map(b =>
          prisma.payment.create({ //for every booking, create payment
            data: {
              bookingId: b.id,
              amount: b.totalPrice,
              paymentStatus: "PENDING",
              method: "Card", 
            }
          })
        )
      )
      //for each booking, create one stripe item
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
    const { paymentId } = req.params;
    const { transactionId } = req.body;
    const userId = req.user.id;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            ground: true,
            user: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    if (payment.booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not your payment"
      });
    }

    // Return successful response for an already-confirmed payment
    if (
      payment.paymentStatus === "SUCCESS" &&
      payment.booking.status === "CONFIRMED"
    ) {
      return res.status(200).json({
        success: true,
        message: "Payment already confirmed!",
        payment,
        matchCode: payment.booking.matchCode
      });
    }

    if (payment.method === "Card") {
      return res.status(400).json({
        success: false,
        message: "Card payments are confirmed automatically."
      });
    }

    // Generate unique match code if one doesn't already exist
    let matchCode = payment.booking.matchCode;

    if (!matchCode) {
      let isUnique = false;

      while (!isUnique) {
        matchCode = generateMatchCode();

        const existing = await prisma.booking.findUnique({
          where: { matchCode }
        });

        if (!existing) isUnique = true;
      }
    }

    // Update payment and booking atomically
    const [updatedPayment, updatedBooking] =
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            paymentStatus: "SUCCESS",
            transactionId:
              transactionId || payment.transactionId || `TXN-${Date.now()}`,
            paidAt: payment.paidAt || new Date()
          }
        }),

        prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: "CONFIRMED",
            matchCode
          },
          include: {
            ground: true,
            user: true,
            payment: true
          }
        })
      ]);

    // Send notification separately.
    // Notification failure must not fail payment confirmation.
    prisma.notification.create({
      data: {
        userId: payment.booking.userId,
        title: "Payment Successful ✅",
        message: `Your payment of Rs ${payment.amount} has been confirmed. Match code: ${matchCode}`,
        type: "PAYMENT"
      }
    }).catch(err => {
      console.error("PAYMENT NOTIFICATION ERROR:", err.message);
    });

    // Send email separately.
    // Email failure must not affect the successful payment response.
    sendBookingConfirmationEmail(
      updatedBooking.user.email,
      updatedBooking
    ).catch(err => {
      console.error("BOOKING EMAIL ERROR:", err.message);
    });

    // Respond immediately after successful database updates
    return res.status(200).json({
      success: true,
      message: "Payment confirmed! Booking is now CONFIRMED.",
      payment: updatedPayment,
      matchCode
    });

  } catch (err) {
    console.error("CONFIRM PAYMENT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Payment confirmation failed. Please check your booking status."
    });
  }
};

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
        data: { status: "CANCELLED" }
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

// Generate unique match code
let matchCode
let isUnique = false
while (!isUnique) {
  matchCode = generateMatchCode()
  const existing = await prisma.booking.findUnique({ where: { matchCode } })
  if (!existing) isUnique = true
}

const booking = await prisma.booking.update({
  where: { id: bookingIds[i] },
  data: { status: "CONFIRMED", matchCode },
  include: { ground: true, user: true, payment: true }
})

await prisma.notification.create({
  data: {
    userId: booking.userId,
    title: "Payment Successful ✅",
    message: `Your payment of Rs ${payment.amount} has been confirmed. Match code: ${matchCode}`,
    type: "PAYMENT"
  }
})

sendBookingEmail(booking.user.email, booking).catch(err => console.error("EMAIL ERROR:", err.message));
return res.json({ success: true });
          }
        }

        console.log(`Bookings ${bookingIds.join(', ')} confirmed via Stripe webhook`)
      } catch (err) {
        console.error("Error processing webhook:", err.message)
      }
    }

    res.json({ received: true })
  }