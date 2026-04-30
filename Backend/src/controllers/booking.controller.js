import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const createBooking = async (req, res) => {
  try {
    const { groundId, bookingDate, startTime, endTime, duration, totalPrice } = req.body
    const userId = req.user.id

    // Check if slot already booked
    const existing = await prisma.booking.findFirst({
      where: { groundId, bookingDate: new Date(bookingDate), startTime }
    })
    if (existing) {
      return res.status(400).json({ message: "This slot is already booked" })
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        groundId,
        bookingDate:  new Date(bookingDate),
        startTime,
        endTime,
        duration:     Number(duration),
        totalPrice:   Number(totalPrice),
        status:       "CONFIRMED"
      }
    })

    res.status(201).json({ message: "Booking confirmed", booking })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where:   { userId: req.user.id },
      include: { ground: { select: { name: true, location: true, city: true } } },
      orderBy: { createdAt: "desc" }
    })
    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}