import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// ============================================
// 🔐 ADMIN LOGIN
// ============================================

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    const admin = await prisma.user.findUnique({
      where: { email }
    })

    // Check if user exists and is admin
    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not an admin."
      })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      })
    }

    // Generate token
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(200).json({
      success: true,
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ============================================
// 📊 ADMIN DASHBOARD STATS
// ============================================

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count()
    const totalGrounds = await prisma.ground.count()
    const totalBookings = await prisma.booking.count()

    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        paymentStatus: "SUCCESS"
      }
    })

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalGrounds,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ============================================
// 👤 GET ALL USERS
// ============================================

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    })

    res.json({ success: true, users })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// 🏟️ GET ALL GROUNDS
// ============================================

export const getAllGrounds = async (req, res) => {
  try {
    const grounds = await prisma.ground.findMany({
      include: {
        owner: true
      }
    })

    res.json({ success: true, grounds })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// 📅 GET ALL BOOKINGS
// ============================================

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        ground: true
      },
      orderBy: { createdAt: "desc" }
    })

    res.json({ success: true, bookings })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// 💳 GET ALL PAYMENTS
// ============================================

export const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: true
      }
    })

    res.json({ success: true, payments })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// 🚨 GET ALL DISPUTES
// ============================================
export const getAllDisputes = async (req, res) => {
  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        user: true,
        ground: true,
        booking: true
      },
      orderBy: { createdAt: "desc" }
    })

    res.status(200).json({
      success: true,
      disputes
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ============================================
// ✅ UPDATE DISPUTE STATUS
// ============================================
export const updateDisputeStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // optional safety check
    const validStatuses = ["PENDING", "IN_REVIEW", "RESOLVED", "REJECTED"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      })
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data: { status }
    })

    res.status(200).json({
      success: true,
      updated
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}