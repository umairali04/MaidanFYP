import express from 'express'
import { uploadImage } from '../controllers/upload.controller.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.post('/', upload.single('file'), uploadImage)

export default router