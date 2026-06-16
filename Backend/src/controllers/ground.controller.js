import prisma from "../utils/prisma.js"

export const getAllGrounds = async (req, res) => {
  try {
    const { sport, city } = req.query

    const grounds = await prisma.ground.findMany({
      where: {
        ...(sport && { sportType: sport }),
        ...(city  && { city: { contains: city, mode: "insensitive" } }),
        isActive: true,
      },
      include: {
        reviews: true,
        owner: { select: { name: true } },
      }
    })

    return res.status(200).json({ grounds })

  } catch (error) {
    console.error("GET GROUNDS ERROR 👉", error)
    return res.status(500).json({ message: error.message })
  }
}

export const getGroundById = async (req, res) => { 
  try {
    const { id } = req.params

    const ground = await prisma.ground.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: { select: { name: true, image: true } }
          }
        },
        owner:    { select: { name: true, phone: true } },
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          },
          select: {
            bookingDate: true,
            startTime:   true,
            endTime:     true,
          }
        }
      }
    })

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" })
    }

    return res.status(200).json({ ground })

  } catch (error) {
    console.error("GET GROUND BY ID ERROR 👉", error)
    return res.status(500).json({ message: error.message })
  }
}

export const createGround = async (req, res) => {
  try {
    const ownerId = req.user.id
 
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
      facilities,
      images,
    } = req.body
 
    if (!name || !sportType || !location || !city || !pricePerHour) {
      return res.status(400).json({ message: "Name, sport type, location, city and price are required." })
    }
 
    const ground = await prisma.ground.create({
      data: {
        name,
        description:  description  ?? null,
        sportType,
        location,
        city,
        latitude:     latitude     ? parseFloat(latitude)   : null,
        longitude:    longitude    ? parseFloat(longitude)  : null,
        pricePerHour: parseFloat(pricePerHour),
        openTime:     openTime     ?? "06:00",
        closeTime:    closeTime    ?? "23:00",
        slotDuration: slotDuration ? parseInt(slotDuration) : 60,
        facilities:   facilities   ?? [],
        images: images ?? [],
        ownerId,
      },
    })
 
    return res.status(201).json(ground)
 
  } catch (error) {
    console.error("CREATE GROUND ERROR 👉", error)
    return res.status(500).json({ message: error.message })
  }
}