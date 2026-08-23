import express from "express"
import {
  searchPlayers,
  getRecommendations,
  getPlayerProfile,
} from "../controllers/player.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

// NOTE: order matters — /recommendations and /search must come before /:userId
router.get("/search", verifyToken, searchPlayers)               // GET /api/players/search?name=&sport=
router.get("/recommendations", verifyToken, getRecommendations) // GET /api/players/recommendations
router.get("/:userId", verifyToken, getPlayerProfile)           // GET /api/players/:userId

export default router