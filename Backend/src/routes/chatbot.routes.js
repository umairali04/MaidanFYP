import express from "express";
import {
  chat,
  getSessions,
  getSessionMessages,
  deleteSession,
  deleteAllSessions,
} from "../controllers/chatbot.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, chat);                              // send message
router.get("/sessions", verifyToken, getSessions);               // get all sessions (sidebar)
router.get("/sessions/:sessionId", verifyToken, getSessionMessages); // load a session
router.delete("/sessions/:sessionId", verifyToken, deleteSession);   // delete one session
router.delete("/sessions", verifyToken, deleteAllSessions);          // delete all sessions

export default router;