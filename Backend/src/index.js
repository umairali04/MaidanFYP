import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";


const app = express();

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}))
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
