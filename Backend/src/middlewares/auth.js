import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const [scheme, tokenFromHeader] = authHeader && authHeader.split(" ")[1];
  const tokenFromCookie = req.cookies?.accessToken;

  const token =
    scheme === "Bearer" && tokenFromHeader ? tokenFromHeader : tokenFromCookie;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    const msg =
      error.name === "TokenExpiredError"
        ? "Access token expired"
        : "Invalid token";
    return res.status(500).json({ message: msg });
  }
};

export const authorizeRole = (roles) => {
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

export const verifyEmail = async (req, res, next) => {
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

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again after 15 minutes",
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: "Too many registration attempts, please try again after 1 hour",
});

export const voteLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // 1 vote per day
  message: "You can only vote once per day",
});
