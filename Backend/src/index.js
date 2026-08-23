import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import groundRoutes from "./routes/ground.routes.js";
import bookingRoutes from "./routes/booking.routes.js"; // ← ADD THIS
import uploadRoutes from './routes/upload.routes.js'
import ownerRoutes from './routes/owner.routes.js'
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import disputeRoutes from "./routes/dispute.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";

import connectionRoutes from "./routes/connection.routes.js";
import playerRoutes from "./routes/player.routes.js";
import messageRoutes from "./routes/message.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js"

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json());

app.use("/api/auth",     authRoutes);
app.use("/api/grounds",  groundRoutes); 
app.use("/api/bookings", bookingRoutes); // ← ADD THIS
app.use('/api/upload', uploadRoutes)
app.use('/api/owner', ownerRoutes)

app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/disputes", disputeRoutes);

app.use("/api/wallet", walletRoutes)
app.use("/api/chatbot", chatbotRoutes);

app.use("/api/connections", connectionRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/recommendations", recommendationRoutes)

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});