import express from "express"
import { getAllGrounds } from "../controllers/ground.controller.js"

const router = express.Router()

router.get("/", getAllGrounds)

export default router