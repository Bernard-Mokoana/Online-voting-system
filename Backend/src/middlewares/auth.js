import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../database/database.js";

// Verify JWT token
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

// Role-based authorization
const authorizeRole = (roles) => {
  return async (req, res, next) => {
    try {
      let userRole;
      if (req.user.role === "admin") {
        const result = await pool.query(
          "SELECT * FROM admin WHERE adminid = $1",
          [req.user.id]
        );
        userRole = "admin";
        if (!result.rows.length)
          return res.status(404).json({ message: "Admin not found" });
      } else {
        const result = await pool.query(
          "SELECT * FROM voter WHERE voterid = $1",
          [req.user.id]
        );
        userRole = "voter";
        if (!result.rows.length)
          return res.status(404).json({ message: "Voter not found" });
      }
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      next();
    } catch (error) {
      console.error("Role authorization error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

// Verify email middleware
const verifyEmail = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT is_verified FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!result.rows[0].is_verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    next();
  } catch (error) {
    console.error("Email verification check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Rate limiting middleware
import { rateLimit } from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again after 15 minutes",
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: "Too many registration attempts, please try again after 1 hour",
});

const voteLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // 1 vote per day
  message: "You can only vote once per day",
});

export {
  authenticateToken,
  authorizeRole,
  verifyEmail,
  loginLimiter,
  registerLimiter,
  voteLimiter,
};
