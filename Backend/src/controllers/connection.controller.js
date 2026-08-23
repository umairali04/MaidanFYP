import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// Fields safe to expose about another player — never email/phone/password
const publicUserSelect = {
  id: true,
  name: true,
  image: true,
  preferredSports: true,
}

// ============================================
// 🤝 SEND CONNECTION REQUEST
// POST /api/connections/request
// body: { receiverId }
// ============================================
export const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user.id
    const { receiverId } = req.body

    if (!receiverId) {
      return res.status(400).json({ success: false, message: "receiverId is required" })
    }

    if (receiverId === senderId) {
      return res.status(400).json({ success: false, message: "You can't connect with yourself" })
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Player not found" })
    }

    // Check if a connection already exists in either direction
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    })

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return res.status(400).json({ success: false, message: "You're already connected" })
      }
      if (existing.status === "PENDING") {
        return res.status(400).json({ success: false, message: "A request is already pending" })
      }
      // Previously REJECTED → allow a fresh request by resetting it
      const revived = await prisma.connection.update({
        where: { id: existing.id },
        data: { status: "PENDING", senderId, receiverId },
      })
      return res.status(200).json({ success: true, message: "Connection request sent", connection: revived })
    }

    const connection = await prisma.connection.create({
      data: { senderId, receiverId, status: "PENDING" },
    })

    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: "New Connection Request 🤝",
        message: `${req.user.name} wants to connect with you.`,
        type: "SYSTEM",
      },
    })

    res.status(201).json({ success: true, message: "Connection request sent", connection })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// ✅ RESPOND TO CONNECTION REQUEST (accept/reject)
// PUT /api/connections/:connectionId/respond
// body: { action: "ACCEPT" | "REJECT" }
// ============================================
export const respondToConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id
    const { connectionId } = req.params
    const { action } = req.body

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return res.status(400).json({ success: false, message: "action must be ACCEPT or REJECT" })
    }

    const connection = await prisma.connection.findUnique({ where: { id: connectionId } })

    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection request not found" })
    }

    if (connection.receiverId !== userId) {
      return res.status(403).json({ success: false, message: "You can't respond to this request" })
    }

    if (connection.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "This request has already been handled" })
    }

    const newStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED"

    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: newStatus },
    })

    if (newStatus === "ACCEPTED") {
      await prisma.notification.create({
        data: {
          userId: connection.senderId,
          title: "Connection Accepted ✅",
          message: `${req.user.name} accepted your connection request.`,
          type: "SYSTEM",
        },
      })
    }

    res.json({ success: true, message: `Request ${newStatus.toLowerCase()}`, connection: updated })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 📥 GET INCOMING PENDING REQUESTS
// GET /api/connections/requests/incoming
// ============================================
export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await prisma.connection.findMany({
      where: { receiverId: req.user.id, status: "PENDING" },
      include: { sender: { select: publicUserSelect } },
      orderBy: { createdAt: "desc" },
    })

    res.json({ success: true, requests })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 📤 GET SENT PENDING REQUESTS
// GET /api/connections/requests/sent
// ============================================
export const getSentRequests = async (req, res) => {
  try {
    const requests = await prisma.connection.findMany({
      where: { senderId: req.user.id, status: "PENDING" },
      include: { receiver: { select: publicUserSelect } },
      orderBy: { createdAt: "desc" },
    })

    res.json({ success: true, requests })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 👥 GET MY ACCEPTED CONNECTIONS
// GET /api/connections/my
// ============================================
export const getMyConnections = async (req, res) => {
  try {
    const userId = req.user.id

    const connections = await prisma.connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: publicUserSelect },
        receiver: { select: publicUserSelect },
      },
      orderBy: { updatedAt: "desc" },
    })

    // Flatten so the frontend just gets "the other player" + the connection id
    const players = connections.map((c) => ({
      connectionId: c.id,
      player: c.senderId === userId ? c.receiver : c.sender,
      connectedSince: c.updatedAt,
    }))

    res.json({ success: true, connections: players })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 🗑️ CANCEL / REMOVE A CONNECTION (any status)
// DELETE /api/connections/:connectionId
// ============================================
export const removeConnection = async (req, res) => {
  try {
    const userId = req.user.id
    const { connectionId } = req.params

    const connection = await prisma.connection.findUnique({ where: { id: connectionId } })

    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection not found" })
    }

    if (connection.senderId !== userId && connection.receiverId !== userId) {
      return res.status(403).json({ success: false, message: "Not your connection" })
    }

    await prisma.connection.delete({ where: { id: connectionId } })

    res.json({ success: true, message: "Connection removed" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}