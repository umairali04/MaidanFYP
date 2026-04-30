import express from "express"
import { getAllGrounds, getGroundById } from "../controllers/ground.controller.js"

const router = express.Router()

router.get("/",    getAllGrounds)
router.get("/:id", getGroundById)

export default router