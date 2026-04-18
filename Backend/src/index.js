import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import groundRoutes from "./routes/ground.routes.js";


const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/grounds", groundRoutes); 

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
