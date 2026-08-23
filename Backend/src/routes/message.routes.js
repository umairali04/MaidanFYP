import express from "express"
import {
  sendMessage,
  sendMediaMessage,
  getConversation,
  getInbox
} from "../controllers/message.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/upload.js"

const router = express.Router()

router.post("/",              verifyToken, sendMessage)                          // POST /api/messages
router.post("/media",         verifyToken, upload.single("file"), sendMediaMessage) // POST /api/messages/media
router.get("/",               verifyToken, getInbox)                              // GET  /api/messages
router.get("/:otherUserId",   verifyToken, getConversation)                       // GET  /api/messages/:otherUserId

export default router