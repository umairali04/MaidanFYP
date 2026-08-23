import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// Fields safe to expose about another player — never email/phone/password
const publicUserSelect = {
  id: true,
  name: true,
  image: true,
  city: true,
  role: true,
  preferredSports: true,
  createdAt: true,
}

// Helper: get set of userIds already connected (or pending) with current user
async function getExcludedIds(userId) {
  const existing = await prisma.connection.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    select: { senderId: true, receiverId: true },
  })

  const excluded = new Set([userId])
  existing.forEach((c) => {
    excluded.add(c.senderId)
    excluded.add(c.receiverId)
  })
  return excluded
}

// Helper: attach connectionStatus (NONE / PENDING_SENT / PENDING_RECEIVED / ACCEPTED)
// to a list of player objects, relative to the current user
async function attachConnectionStatus(players, userId) {
  const ids = players.map((p) => p.id)
  if (ids.length === 0) return players

  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: { in: ids } },
        { receiverId: userId, senderId: { in: ids } },
      ],
    },
  })

  const statusMap = {}
  connections.forEach((c) => {
    const otherId = c.senderId === userId ? c.receiverId : c.senderId
    if (c.status === "ACCEPTED") {
      statusMap[otherId] = "ACCEPTED"
    } else if (c.status === "PENDING") {
      statusMap[otherId] = c.senderId === userId ? "PENDING_SENT" : "PENDING_RECEIVED"
    }
    // REJECTED connections are left out → shown as NONE so a fresh request can be sent
  })

  return players.map((p) => ({
    ...p,
    connectionStatus: statusMap[p.id] || "NONE",
    connectionId: connections.find(
      (c) => c.senderId === p.id || c.receiverId === p.id
    )?.id,
  }))
}

// ============================================
// 🔍 SEARCH PLAYERS
// GET /api/players/search?name=&sport=
// ============================================
export const searchPlayers = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, sport, city } = req.query

    const where = {
      id: { not: userId },
      role: "PLAYER",
    }

    if (name) {
      where.name = { contains: name, mode: "insensitive" }
    }

    if (sport) {
      where.preferredSports = { has: sport }
    }

    if (city) {
      where.city = { equals: city, mode: "insensitive" }
    }

    const players = await prisma.user.findMany({
      where,
      select: publicUserSelect,
      take: 30,
      orderBy: { name: "asc" },
    })

    const withStatus = await attachConnectionStatus(players, userId)

    res.json({ success: true, players: withStatus })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// ✨ RECOMMENDED PLAYERS ("players you may know")
// GET /api/players/recommendations
// Ranked by: (1) played together before, (2) same city, (3) # shared sports
// ============================================
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredSports: true, city: true },
    })

    if (!currentUser || currentUser.preferredSports.length === 0) {
      return res.json({ success: true, players: [], message: "Add preferred sports to get recommendations" })
    }

    const excludedIds = await getExcludedIds(userId)

    // Candidates who share at least one sport
    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: [...excludedIds] },
        role: "PLAYER",
        preferredSports: { hasSome: currentUser.preferredSports },
      },
      select: publicUserSelect,
      take: 50,
    })

    if (candidates.length === 0) {
      return res.json({ success: true, players: [] })
    }

    // "Played together" signal: bookings where the current user was a participant
    const myBookingIds = (
      await prisma.matchParticipant.findMany({
        where: { userId },
        select: { bookingId: true },
      })
    ).map((m) => m.bookingId)

    let playedWithCounts = {}
    if (myBookingIds.length > 0) {
      const coParticipants = await prisma.matchParticipant.findMany({
        where: {
          bookingId: { in: myBookingIds },
          userId: { in: candidates.map((c) => c.id) },
        },
        select: { userId: true },
      })
      coParticipants.forEach((p) => {
        playedWithCounts[p.userId] = (playedWithCounts[p.userId] || 0) + 1
      })
    }

    // Rank: played together (strongest) > same city > # shared sports
    const ranked = candidates
      .map((c) => {
        const sharedSports = c.preferredSports.filter((s) =>
          currentUser.preferredSports.includes(s)
        ).length
        const sameCity =
          !!currentUser.city && !!c.city &&
          c.city.toLowerCase() === currentUser.city.toLowerCase()
        return {
          ...c,
          sharedSportsCount: sharedSports,
          playedTogetherCount: playedWithCounts[c.id] || 0,
          sameCity,
        }
      })
      .sort((a, b) => {
        if (b.playedTogetherCount !== a.playedTogetherCount) {
          return b.playedTogetherCount - a.playedTogetherCount
        }
        if (b.sameCity !== a.sameCity) {
          return b.sameCity ? 1 : -1
        }
        return b.sharedSportsCount - a.sharedSportsCount
      })
      .slice(0, 10)

    res.json({ success: true, players: ranked })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 👤 GET A PLAYER'S PUBLIC PROFILE
// GET /api/players/:userId
// ============================================
export const getPlayerProfile = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user.id

    const player = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    })

    if (!player) {
      return res.status(404).json({ success: false, message: "Player not found" })
    }

    const [withStatus] = await attachConnectionStatus([player], currentUserId)

    res.json({ success: true, player: withStatus })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}