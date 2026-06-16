import express from "express"
import { getAllGrounds, getGroundById, createGround } from "../controllers/ground.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/",    getAllGrounds)
router.get("/:id", getGroundById)
router.post("/",    verifyToken, createGround)

export default router