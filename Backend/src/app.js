import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

import voterRoutes from "./routes/voterRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import candidateRoutes from "./routes/candidatesRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/v1/voters", voterRoutes);
// app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/elections", electionRoutes);
app.use("/api/v1/candidates", candidateRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Online Voting API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

export default app;
