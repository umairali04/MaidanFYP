import { PrismaClient } from "@prisma/client"
import cloudinary from "../utils/cloudinary.js"

const prisma = new PrismaClient()

// ============================================
// 🔧 HELPER — check two users are ACCEPTED connections
// ============================================
const areConnected = async (userId1, userId2) => {
  const connection = await prisma.connection.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }
  })
  return !!connection
}

// ============================================
// 💬 SEND TEXT MESSAGE
// ============================================
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id
    const { receiverId, content } = req.body

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: "receiverId and content are required" })
    }

    const connected = await areConnected(senderId, receiverId)
    if (!connected) {
      return res.status(403).json({ success: false, message: "You can only message connected players" })
    }

    const newMessage = await prisma.message.create({
      data: { senderId, receiverId, content, type: "TEXT" }
    })

    res.status(201).json({ success: true, message: newMessage })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 🎙️🖼️ SEND IMAGE OR VOICE MESSAGE
// Uses multer (req.file) + Cloudinary, same pattern as upload.controller.js
// ============================================
export const sendMediaMessage = async (req, res) => {
  try {
    const senderId = req.user.id
    const { receiverId, type, duration } = req.body // type: "IMAGE" or "VOICE"

    if (!receiverId || !type) {
      return res.status(400).json({ success: false, message: "receiverId and type are required" })
    }

    if (!["IMAGE", "VOICE"].includes(type)) {
      return res.status(400).json({ success: false, message: "type must be IMAGE or VOICE" })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    const connected = await areConnected(senderId, receiverId)
    if (!connected) {
      return res.status(403).json({ success: false, message: "You can only message connected players" })
    }

    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`

    // resource_type "auto" lets Cloudinary correctly handle both images and audio files
    const result = await cloudinary.uploader.upload(fileStr, {
      folder: "chat_media",
      resource_type: "auto"
    })

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        type,
        fileUrl: result.secure_url,
        duration: duration ? Number(duration) : null
      }
    })

    res.status(201).json({ success: true, message: newMessage })

  } catch (err) {
    console.error("MEDIA MESSAGE ERROR:", err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 📜 GET CONVERSATION WITH A SPECIFIC PLAYER
// ============================================
export const getConversation = async (req, res) => {
  try {
    const userId = req.user.id
    const { otherUserId } = req.params

    const connected = await areConnected(userId, otherUserId)
    if (!connected) {
      return res.status(403).json({ success: false, message: "You are not connected with this player" })
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: "asc" }
    })

    // mark messages sent TO me as read
    await prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: userId, isRead: false },
      data: { isRead: true }
    })

    res.json({ success: true, messages })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 📋 GET ALL CONVERSATIONS (inbox list)
// Returns the latest message per connected player
// ============================================
export const getInbox = async (req, res) => {
  try {
    const userId = req.user.id

    const connections = await prisma.connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender:   { select: { id: true, name: true, image: true, preferredSports: true } },
        receiver: { select: { id: true, name: true, image: true, preferredSports: true } }
      }
    })

    const conversations = await Promise.all(connections.map(async (c) => {
      const otherUser = c.senderId === userId ? c.receiver : c.sender

      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUser.id },
            { senderId: otherUser.id, receiverId: userId }
          ]
        },
        orderBy: { createdAt: "desc" }
      })

      const unreadCount = await prisma.message.count({
        where: { senderId: otherUser.id, receiverId: userId, isRead: false }
      })

      return { player: otherUser, lastMessage, unreadCount }
    }))

    // most recent conversation first
    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? 0
      const bTime = b.lastMessage?.createdAt ?? 0
      return new Date(bTime) - new Date(aTime)
    })

    res.json({ success: true, conversations })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}