// controllers/owner.controller.js - SIMPLIFIED & BULLETPROOF
import prisma from '../utils/prisma.js'

export const getOwnerStats = async (req, res) => {
  try {
    const userId = req.user.id

    // 1. GROUNDS
    const grounds = await prisma.ground.findMany({
      where: { ownerId: userId },
      select: { id: true },
    })
    const groundIds = grounds.map(g => g.id)
    const totalGrounds = groundIds.length

    // 2. DATE RANGE
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // 3. BOOKINGS
    const totalBookingsAllTime = await prisma.booking.count({
      where: {
        groundId: { in: groundIds },
        status: 'CONFIRMED',
      },
    })

    // 🔥 4. REVENUE - SIMPLEST METHOD (fetch all & sum manually)
    const allPayments = await prisma.payment.findMany({
      where: {
        paymentStatus: 'SUCCESS',
        bookingId: {
          in: await prisma.booking.findMany({
            where: { groundId: { in: groundIds } },
            select: { id: true },
          }).then(b => b.map(booking => booking.id)),
        },
      },
      select: { amount: true },
    })

    const monthPayments = await prisma.payment.findMany({
      where: {
        paymentStatus: 'SUCCESS',
        bookingId: {
          in: await prisma.booking.findMany({
            where: {
              groundId: { in: groundIds },
              bookingDate: { gte: startOfMonth, lte: endOfMonth },
            },
            select: { id: true },
          }).then(b => b.map(booking => booking.id)),
        },
      },
      select: { amount: true },
    })

    const totalRevenueAllTime = allPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const totalRevenueThisMonth = monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)

    console.log('✅ STATS GENERATED:', {
      totalGrounds,
      totalBookingsAllTime,
      totalBookingsThisMonth,
      totalRevenueAllTime,
      totalRevenueThisMonth,
      paymentCountAll: allPayments.length,
      paymentCountMonth: monthPayments.length,
    })

    res.json({
      totalGrounds,
      totalBookingsAllTime,
      totalBookingsThisMonth,
      totalRevenueAllTime,
      totalRevenueThisMonth,
    })

  } catch (err) {
    console.error('❌ FULL ERROR:', err)
    res.status(500).json({ 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    })
  }
}

// ─── GET all grounds belonging to the logged-in owner ───────────────────────
export const getOwnerGrounds = async (req, res) => {
  try {
    const ownerId = req.user.id

    const grounds = await prisma.ground.findMany({
      where: { ownerId },
      include: {
        reviews: true,
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ grounds })

  } catch (error) {
    console.error('GET OWNER GROUNDS ERROR 👉', error)
    return res.status(500).json({ message: error.message })
  }
}

// ─── GET a single ground by id — only if it belongs to the logged-in owner ──
export const getOwnerGroundById = async (req, res) => {
  try {
    const ownerId = req.user.id
    const { id } = req.params

    const ground = await prisma.ground.findUnique({
      where: { id },
    })

    if (!ground) {
      return res.status(404).json({ message: 'Ground not found.' })
    }

    // Ownership check
    if (ground.ownerId !== ownerId) {
      return res.status(403).json({ message: 'You are not authorized to view this ground.' })
    }

    return res.status(200).json(ground)

  } catch (error) {
    console.error('GET OWNER GROUND BY ID ERROR 👉', error)
    return res.status(500).json({ message: error.message })
  }
}

// ─── UPDATE a ground — only if it belongs to the logged-in owner ────────────
export const updateOwnerGround = async (req, res) => {
  try {
    const ownerId = req.user.id
    const { id } = req.params

    // Check ground exists and belongs to this owner
    const existing = await prisma.ground.findUnique({ where: { id } })

    if (!existing) {
      return res.status(404).json({ message: 'Ground not found.' })
    }

    if (existing.ownerId !== ownerId) {
      return res.status(403).json({ message: 'You are not authorized to edit this ground.' })
    }

    const {
      name,
      description,
      sportType,
      location,
      city,
      latitude,
      longitude,
      pricePerHour,
      openTime,
      closeTime,
      slotDuration,
      isActive,
      facilities,
      images,
    } = req.body

    if (!name || !sportType || !location || !city || !pricePerHour) {
      return res.status(400).json({ message: 'Name, sport type, location, city and price are required.' })
    }

    const updated = await prisma.ground.update({
      where: { id },
      data: {
        name,
        description:  description  ?? null,
        sportType,
        location,
        city,
        latitude:     latitude     != null ? parseFloat(latitude)   : null,
        longitude:    longitude    != null ? parseFloat(longitude)  : null,
        pricePerHour: parseFloat(pricePerHour),
        openTime:     openTime     ?? existing.openTime,
        closeTime:    closeTime    ?? existing.closeTime,
        slotDuration: slotDuration ? parseInt(slotDuration) : existing.slotDuration,
        isActive:     isActive     ?? existing.isActive,
        facilities:   facilities   ?? [],
        images:       images       ?? [],
      },
    })

    return res.status(200).json(updated)

  } catch (error) {
    console.error('UPDATE GROUND ERROR 👉', error)
    return res.status(500).json({ message: error.message })
  }
}


export const debugRevenue = async (req, res) => {
  const userId = req.user.id

  const grounds = await prisma.ground.findMany({
    where: { ownerId: userId },
    select: { id: true },
  })
  const groundIds = grounds.map(g => g.id)

  const allBookings = await prisma.booking.findMany({
    where: { groundId: { in: groundIds } },
    include: { payment: true },
  })

  res.json({
    groundIds,
    totalBookings: allBookings.length,
    bookingsWithPayment: allBookings.filter(b => b.payment).length,
    bookingsWithoutPayment: allBookings.filter(b => !b.payment).length,
    paymentStatuses: allBookings.map(b => ({
      bookingId: b.id,
      status: b.status,
      paymentStatus: b.payment?.paymentStatus ?? 'NO PAYMENT RECORD',
      amount: b.payment?.amount ?? 0,
    })),
  })
}