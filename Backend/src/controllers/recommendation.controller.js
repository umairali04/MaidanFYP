import prisma from "../utils/prisma.js"

// ============================================
// 🎯 AI SLOT RECOMMENDATION ENGINE
// Weighted multi-criteria scoring based on:
// sport match, location proximity, price fit, time pattern fit
// ============================================

const WEIGHTS = {
  sportMatch: 3,
  locationFit: 2.5,
  priceFit: 2,
  timePatternFit: 1.5
}

const DEFAULT_DAYS_AHEAD = 7

// ---------------- Helpers ----------------

function distanceKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v === null || v === undefined)) return null
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function hourFromTimeStr(timeStr) {
  return Number(timeStr.split(":")[0])
}

function minutesFromTimeStr(timeStr) {
  const [h, m] = timeStr.split(":").map(Number)
  return h * 60 + m
}

function minutesToTimeStr(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, "0")
  const m = (mins % 60).toString().padStart(2, "0")
  return `${h}:${m}`
}

function isSameDate(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

// ---------------- User profile ----------------

async function buildUserProfile(userId) {
  const bookings = await prisma.booking.findMany({
    where: {
      userId,
      status: { in: ["CONFIRMED", "COMPLETED"] }
    },
    include: { ground: true },
    orderBy: { bookingDate: "desc" },
    take: 50
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { city: true, preferredSports: true }
  })

  if (bookings.length === 0) {
    return {
      hasHistory: false,
      preferredSports: user?.preferredSports ?? [],
      city: user?.city ?? null
    }
  }

  const sportCounts = {}
  const hourCounts = {}
  const dayCounts = {}
  let totalPricePerHour = 0
  let lastLat = null
  let lastLng = null
  let lastCity = user?.city ?? null

  for (const b of bookings) {
    const sport = b.ground.sportType
    sportCounts[sport] = (sportCounts[sport] || 0) + 1

    const hour = hourFromTimeStr(b.startTime)
    hourCounts[hour] = (hourCounts[hour] || 0) + 1

    const day = new Date(b.bookingDate).getDay()
    dayCounts[day] = (dayCounts[day] || 0) + 1

    totalPricePerHour += b.duration > 0 ? b.totalPrice / b.duration : b.totalPrice

    if (b.ground.latitude && b.ground.longitude) {
      lastLat = b.ground.latitude
      lastLng = b.ground.longitude
      lastCity = b.ground.city
    }
  }

  const favoriteSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0][0]
  const favoriteHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => Number(h))
  const favoriteDays = Object.entries(dayCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => Number(d))

  return {
    hasHistory: true,
    favoriteSport,
    favoriteHours,
    favoriteDays,
    avgPricePerHour: totalPricePerHour / bookings.length,
    lastLat,
    lastLng,
    city: lastCity,
    preferredSports: user?.preferredSports ?? []
  }
}

// ---------------- Slot generation ----------------

async function generateAvailableSlots(ground, daysAhead = DEFAULT_DAYS_AHEAD) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const rangeEnd = new Date(today)
  rangeEnd.setDate(rangeEnd.getDate() + daysAhead)

  const [existingBookings, blockedSlots] = await Promise.all([
    prisma.booking.findMany({
      where: {
        groundId: ground.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        bookingDate: { gte: today, lt: rangeEnd }
      }
    }),
    prisma.blockedSlot.findMany({
      where: {
        groundId: ground.id,
        date: { gte: today, lt: rangeEnd }
      }
    })
  ])

  const openMins = minutesFromTimeStr(ground.openTime)
  const closeMins = minutesFromTimeStr(ground.closeTime)
  const duration = ground.slotDuration

  const slots = []

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() + dayOffset)

    const dayBookings = existingBookings.filter((b) => isSameDate(new Date(b.bookingDate), date))
    const dayBlocks = blockedSlots.filter((bs) => isSameDate(new Date(bs.date), date))

    if (dayBlocks.some((bl) => bl.isFullDay)) continue

    for (let start = openMins; start + duration <= closeMins; start += duration) {
      const end = start + duration
      const startStr = minutesToTimeStr(start)
      const endStr = minutesToTimeStr(end)

      const overlapsBooking = dayBookings.some((b) => {
        const bStart = minutesFromTimeStr(b.startTime)
        const bEnd = minutesFromTimeStr(b.endTime)
        return start < bEnd && end > bStart
      })

      const overlapsBlock = dayBlocks.some((bl) => {
        const blStart = minutesFromTimeStr(bl.startTime)
        const blEnd = minutesFromTimeStr(bl.endTime)
        return start < blEnd && end > blStart
      })

      if (overlapsBooking || overlapsBlock) continue

      slots.push({ date: new Date(date), startTime: startStr, endTime: endStr })
    }
  }

  return slots
}

// ---------------- Scoring ----------------

function scoreCandidate(ground, slot, profile) {
  const breakdown = {}

  if (!profile.hasHistory) {
    breakdown.sportMatch = profile.preferredSports?.includes(ground.sportType) ? 1 : 0.4
    breakdown.locationFit = profile.city && profile.city === ground.city ? 1 : 0.4
    breakdown.priceFit = 0.5
    breakdown.timePatternFit = 0.5
  } else {
    breakdown.sportMatch = ground.sportType === profile.favoriteSport ? 1 : 0

    if (profile.lastLat && profile.lastLng && ground.latitude && ground.longitude) {
      const dist = distanceKm(profile.lastLat, profile.lastLng, ground.latitude, ground.longitude)
      breakdown.locationFit = Math.max(0, 1 - dist / 15)
    } else {
      breakdown.locationFit = profile.city === ground.city ? 1 : 0.3
    }

    const priceDiff = Math.abs(ground.pricePerHour - profile.avgPricePerHour)
    breakdown.priceFit = Math.max(0, 1 - priceDiff / (profile.avgPricePerHour || 1))

    const slotHour = hourFromTimeStr(slot.startTime)
    const slotDay = new Date(slot.date).getDay()
    const hourMatch = profile.favoriteHours.includes(slotHour) ? 1 : 0
    const dayMatch = profile.favoriteDays.includes(slotDay) ? 1 : 0
    breakdown.timePatternFit = (hourMatch + dayMatch) / 2
  }

  const weightedSum =
    breakdown.sportMatch * WEIGHTS.sportMatch +
    breakdown.locationFit * WEIGHTS.locationFit +
    breakdown.priceFit * WEIGHTS.priceFit +
    breakdown.timePatternFit * WEIGHTS.timePatternFit

  const maxPossible = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
  const normalizedScore = weightedSum / maxPossible

  return { score: normalizedScore, breakdown }
}

// ============================================
// 🎯 GET SLOT RECOMMENDATIONS
// GET /api/recommendations/slots?sportType=FOOTBALL&limit=5&daysAhead=7
// ============================================
export const getSlotRecommendations = async (req, res) => {
  try {
    const userId = req.user.id
    const { sportType, limit, daysAhead } = req.query

    const parsedLimit = limit ? Number(limit) : 5
    const parsedDaysAhead = daysAhead ? Number(daysAhead) : DEFAULT_DAYS_AHEAD

    const profile = await buildUserProfile(userId)

    const grounds = await prisma.ground.findMany({
      where: {
        isActive: true,
        ...(sportType ? { sportType } : {})
      }
    })

    const candidates = []

    for (const ground of grounds) {
      const slots = await generateAvailableSlots(ground, parsedDaysAhead)
      for (const slot of slots) {
        const { score, breakdown } = scoreCandidate(ground, slot, profile)
        candidates.push({
          groundId: ground.id,
          groundName: ground.name,
          sportType: ground.sportType,
          city: ground.city,
          image: ground.images?.[0] || null,
          pricePerHour: ground.pricePerHour,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          score,
          breakdown
        })
      }
    }

    candidates.sort((a, b) => b.score - a.score)

let finalRecommendations

if (!sportType) {
  // All Sports:
  // Make sure the results are diversified across available sports.

  const selected = []
  const usedSports = new Set()

  // First: take the best recommendation from each sport
  for (const candidate of candidates) {
    if (!usedSports.has(candidate.sportType)) {
      selected.push(candidate)
      usedSports.add(candidate.sportType)

      if (selected.length >= parsedLimit) {
        break
      }
    }
  }

  // Second: fill remaining slots with the highest-scoring
  // candidates regardless of sport.
  if (selected.length < parsedLimit) {
    const selectedKeys = new Set(
      selected.map(
        (item) =>
          `${item.groundId}-${item.date}-${item.startTime}`
      )
    )

    for (const candidate of candidates) {
      const key = `${candidate.groundId}-${candidate.date}-${candidate.startTime}`

      if (selectedKeys.has(key)) continue

      selected.push(candidate)
      selectedKeys.add(key)

      if (selected.length >= parsedLimit) {
        break
      }
    }
  }

  finalRecommendations = selected
} else {
  // Specific sport selected:
  // Keep the existing ranking behavior.
  finalRecommendations = candidates.slice(0, parsedLimit)
}

res.json({
  success: true,
  recommendations: finalRecommendations
})

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}