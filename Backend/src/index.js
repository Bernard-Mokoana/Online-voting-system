import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Pool } from "pg";
import dotenv from "dotenv";

const app = express();

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

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

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
  };
};

// Auth Routes
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      idNumber,
      password,
      dateOfBirth,
      phoneNumber,
      role = "voter",
    } = req.body;

    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR id_number = $2",
      [email, idNumber]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (
        first_name, last_name, email, id_number, password,
        date_of_birth, phone_number, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        firstName,
        lastName,
        email,
        idNumber,
        hashedPassword,
        dateOfBirth,
        phoneNumber,
        role,
      ]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Protected Routes
app.get("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, id_number, date_of_birth, phone_number, role FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Candidate Routes
app.get("/api/candidates", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM candidates WHERE status = $1",
      ["active"]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Candidates fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Vote Routes
app.post("/api/votes", authenticateToken, async (req, res) => {
  try {
    const { candidateId } = req.body;
    const userId = req.user.id;

    // Check if user has already voted
    const existingVote = await pool.query(
      "SELECT * FROM votes WHERE user_id = $1",
      [userId]
    );

    if (existingVote.rows.length > 0) {
      return res.status(400).json({ message: "You have already voted" });
    }

    // Record the vote
    await pool.query(
      "INSERT INTO votes (user_id, candidate_id) VALUES ($1, $2)",
      [userId, candidateId]
    );

    // Update candidate vote count
    await pool.query("UPDATE candidates SET votes = votes + 1 WHERE id = $1", [
      candidateId,
    ]);

    res.json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.error("Vote recording error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Results Route
app.get("/api/votes/results", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT c.*, COUNT(v.id) as vote_count FROM candidates c LEFT JOIN votes v ON c.id = v.candidate_id GROUP BY c.id ORDER BY vote_count DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Results fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin Routes
app.get(
  "/api/admin/dashboard",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const stats = {
        totalVoters: (
          await pool.query("SELECT COUNT(*) FROM users WHERE role = $1", [
            "voter",
          ])
        ).rows[0].count,
        totalCandidates: (await pool.query("SELECT COUNT(*) FROM candidates"))
          .rows[0].count,
        totalVotes: (await pool.query("SELECT COUNT(*) FROM votes")).rows[0]
          .count,
        activeElections: (
          await pool.query("SELECT COUNT(*) FROM elections WHERE status = $1", [
            "active",
          ])
        ).rows[0].count,
      };
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // Close server & exit process
  pool.end(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Close server & exit process
  pool.end(() => {
    process.exit(1);
  });
});
