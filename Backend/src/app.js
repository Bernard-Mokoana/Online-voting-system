import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// Import routes
import voterRoutes from "./routes/voterRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import candidateRoutes from "./routes/candidatesRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/voters", voterRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/admin", adminRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("Online Voting API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

export default app;
