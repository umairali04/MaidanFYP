import express from "express"
import { getSlotRecommendations } from "../controllers/recommendation.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/slots", verifyToken, getSlotRecommendations) // GET /api/recommendations/slots

export default router