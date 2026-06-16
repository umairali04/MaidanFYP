// routes/owner.routes.js

import express from 'express'
import {
  getOwnerStats,
  getOwnerGrounds,
  getOwnerGroundById,
  updateOwnerGround,
} from '../controllers/owner.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

// Stats
router.get('/stats', verifyToken, getOwnerStats)

// Owner's own grounds (only their grounds, auth protected)
router.get('/grounds',         verifyToken, getOwnerGrounds)
router.get('/grounds/:id',     verifyToken, getOwnerGroundById)
router.put('/grounds/:id',     verifyToken, updateOwnerGround)


export default router