import cloudinary from "../utils/cloudinary.js"

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`

    const result = await cloudinary.uploader.upload(fileStr, {
      folder: "grounds",
    })

    return res.status(200).json({
      url: result.secure_url,
    })

  } catch (error) {
    console.error("UPLOAD ERROR:", error)
    return res.status(500).json({ message: error.message })
  }
}