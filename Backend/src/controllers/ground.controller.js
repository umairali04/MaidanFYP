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