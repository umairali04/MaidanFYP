import express from "express"
import {
  sendConnectionRequest,
  respondToConnectionRequest,
  getIncomingRequests,
  getSentRequests,
  getMyConnections,
  removeConnection,
} from "../controllers/connection.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/request", verifyToken, sendConnectionRequest)                    // POST   /api/connections/request
router.put("/:connectionId/respond", verifyToken, respondToConnectionRequest)  // PUT    /api/connections/:connectionId/respond
router.get("/requests/incoming", verifyToken, getIncomingRequests)             // GET    /api/connections/requests/incoming
router.get("/requests/sent", verifyToken, getSentRequests)                     // GET    /api/connections/requests/sent
router.get("/my", verifyToken, getMyConnections)                               // GET    /api/connections/my
router.delete("/:connectionId", verifyToken, removeConnection)                 // DELETE /api/connections/:connectionId

export default router