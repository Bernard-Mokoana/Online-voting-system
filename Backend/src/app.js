<<<<<<< HEAD
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();
import client from "./database/database.js";

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const electionRoutes = require("./routes/election");
const voteRoutes = require("./routes/vote");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/votes", voteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Connect to the database once at startup
client
  .connect()
  .then(() => {
    console.log("Database connected successfully!");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

module.exports = app;
=======

import express from './node_modules/express';
const app = express();

app.get("/", (req, res) => {
    res.status(200).send("Welcome to the Online Voting System")
})

app.listen(5000, () => {
    console.log("Server is up and Running")
})
>>>>>>> 5a739bb1043feb6d915c842c77967d38080c8dfb
