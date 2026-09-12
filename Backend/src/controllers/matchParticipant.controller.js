import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// ============================================
// ➕ INVITE A CONNECTION TO YOUR BOOKING/MATCH
// Only the booking's organizer (the user who made it) can invite.
// Respects ground.maxPlayers as the cap on total participants.
// ============================================
export const inviteToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { userId: inviteeId } = req.body //userId is renamed to inviteeId
    const organizerId = req.user.id

    // 1. Booking must exist and belong to the requesting user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { ground: { select: { maxPlayers: true } } } //also gets ground.maxplayers, later need to check 
      // is match already full
    })

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    if (booking.userId !== organizerId) {
      return res.status(403).json({ success: false, message: "Only the organizer can invite players" })
    }

    if (booking.status !== "CONFIRMED") {
      return res.status(400).json({ success: false, message: "You can only invite players to a confirmed booking" })
    }

    // 2. Invitee must be an accepted connection of the organizer
    const connection = await prisma.connection.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: organizerId, receiverId: inviteeId },
          { senderId: inviteeId, receiverId: organizerId }
        ]
      }
    })

    if (!connection) {
      return res.status(400).json({ success: false, message: "You can only invite your connections" })
    }

    // 3. Don't invite the same person twice to the same booking
    const alreadyInvited = await prisma.matchParticipant.findUnique({
      where: { bookingId_userId: { bookingId, userId: inviteeId } }
    })

    if (alreadyInvited) {
      return res.status(400).json({ success: false, message: "Already invited to this match" })
    }

    // 4. Respect maxPlayers cap (count everyone already invited/confirmed, incl. organizer)
    const currentCount = await prisma.matchParticipant.count({ where: { bookingId } })

    if (currentCount >= booking.ground.maxPlayers) { //booking.ground.maxplayers bcz in start we get the ground data but only maxplayers
      return res.status(400).json({ success: false, message: "This match is already full" })
    }

    // 5. Create the invite
    const participant = await prisma.matchParticipant.create({
      data: {
        bookingId,
        userId: inviteeId,
        role: "PLAYER",
        status: "INVITED"
      }
    })

    // 6. Notify the invited player
    await prisma.notification.create({
      data: {
        userId: inviteeId,
        title: "Match Invite 🎾",
        message: `You've been invited to join a match on ${booking.bookingDate.toDateString()} at ${booking.startTime}.`,
        type: "MATCH_INVITE"
      }
    })

    res.status(201).json({ success: true, message: "Player invited", participant })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 📋 GET PARTICIPANTS FOR A BOOKING
// Used to show "3/10 joined" and grey out already-invited connections
// ============================================
export const getBookingParticipants = async (req, res) => {
  try {
    const { bookingId } = req.params

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { ground: { select: { maxPlayers: true } } }
    })

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    const participants = await prisma.matchParticipant.findMany({
      where: { bookingId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { invitedAt: "asc" }
    })

    res.json({
      success: true,
      maxPlayers: booking.ground.maxPlayers,
      participants
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// 📬 GET MY PENDING MATCH INVITES (receiver side)
// Powers the MatchInviteBell dropdown — every INVITED row for this user
// ============================================
export const getMyPendingInvites = async (req, res) => {
  try {
    const userId = req.user.id

    const invites = await prisma.matchParticipant.findMany({
      where: { userId, status: "INVITED" },
      include: {
        booking: {
          include: {
            ground: { select: { name: true, city: true, location: true } },
            user: { select: { id: true, name: true, image: true } } // the organizer
          }
        }
      },
      orderBy: { invitedAt: "desc" }
    })

    res.json({ success: true, invites })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ============================================
// ✅ RESPOND TO A MATCH INVITE (invited player only)
// ============================================
export const respondToInvite = async (req, res) => {
  try {
    const { participantId } = req.params
    const { action } = req.body // "CONFIRM" | "DECLINE"
    const userId = req.user.id

    const participant = await prisma.matchParticipant.findUnique({
      where: { id: participantId }
    })

    if (!participant) {
      return res.status(404).json({ success: false, message: "Invite not found" })
    }

    if (participant.userId !== userId) {
      return res.status(403).json({ success: false, message: "Not your invite" })
    }

    const updated = await prisma.matchParticipant.update({
      where: { id: participantId },
      data: {
        status: action === "CONFIRM" ? "CONFIRMED" : "DECLINED",
        respondedAt: new Date()
      }
    })

    res.json({ success: true, participant: updated })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}