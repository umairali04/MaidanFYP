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

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});