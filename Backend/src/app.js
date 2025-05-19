// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";
// import dotenv from "dotenv";
// dotenv.config();
// import client from "./database/database.js";

// // Import routes
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import electionRoutes from "./routes/electionRoutes.js";
// import voteRoutes from "./routes/voteRoutes.js";

// const app = express();

// // Middleware
// app.use(cors());
// app.use(helmet());
// app.use(morgan("dev"));
// app.use(express.json());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/elections", electionRoutes);
// app.use("/api/votes", voteRoutes);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something went wrong!" });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// // Connect to the database once at startup
// client
//   .connect()
//   .then(() => {
//     console.log("Database connected successfully!");
//   })
//   .catch((err) => {
//     console.error("Database connection error:", err);
//     process.exit(1); // Exit if DB connection fails
//   });

// export default app;

// // import express from "./node_modules/express";
// // const app = express();

// // app.get("/", (req, res) => {
// //   res.status(200).send("Welcome to the Online Voting System");
// // });

// // app.listen(5000, () => {
// //   console.log("Server is up and Running");
// // });

// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";
// import dotenv from "dotenv";
// dotenv.config();

// import authRoutes from "./routes/authRoutes.js";

// const app = express();

// app.use(cors());
// app.use(helmet());
// app.use(morgan("dev"));
// app.use(express.json());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });
// app.use(limiter);

// app.use("/api/auth", authRoutes);

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something went wrong!" });
// });

// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// export default app;

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import morgan from "morgan";

// import voterRoutes from "./routes/voterRoutes.js";
// import addressRoutes from "./routes/addressRoutes.js";

// // Load environment variables
// dotenv.config();

// // Initialize Express
// const app = express();

// // Middlewares
// app.use(cors()); // Allow cross-origin requests
// app.use(express.json()); // Parse JSON bodies
// app.use(morgan("dev")); // Log HTTP requests (optional but helpful)

// // Routes
// app.use("/api/voters", voterRoutes);
// app.use("/api/addresses", addressRoutes);

// // Health Check
// app.get("/", (req, res) => {
//   res.send(" Online Voting API is running...");
// });

// // Error handling middleware (optional)
// app.use((err, req, res, next) => {
//   console.error(" Error:", err.stack);
//   res.status(500).json({ message: "Server error", error: err.message });
// });

// export default app;

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// Import routes
import voterRoutes from "./routes/voterRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // ✅ New import

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middlewares
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // Log HTTP requests

// Routes
app.use("/api/voters", voterRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/auth", authRoutes); // ✅ Add auth route here

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
