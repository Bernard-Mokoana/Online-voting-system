import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const tokenFromCookie = req.cookies?.accessToken;
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (tokenFromCookie) {
    token = tokenFromCookie;
  }

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    const msg =
      error.name === "TokenExpiredError"
        ? "Access token expired"
        : "Invalid token";
    return res.status(401).json({ message: msg });
  }
};

// FIX #3: authorizeRole now correctly handles voter, candidate, AND admin roles.
export const authorizeRole = (roles) => {
  return async (req, res, next) => {
    try {
      let userRole;

      if (req.user.role === "admin") {
        const result = await pool.query(
          "SELECT adminid FROM admin WHERE adminid = $1",
          [req.user.id]
        );
        if (!result.rows.length)
          return res.status(404).json({ message: "Admin not found" });
        userRole = "admin";
      } else if (req.user.role === "candidate") {
        const result = await pool.query(
          "SELECT candidateid FROM candidate WHERE candidateid = $1",
          [req.user.id]
        );
        if (!result.rows.length)
          return res.status(404).json({ message: "Candidate not found" });
        userRole = "candidate";
      } else {
        const result = await pool.query(
          "SELECT voterid FROM voter WHERE voterid = $1",
          [req.user.id]
        );
        if (!result.rows.length)
          return res.status(404).json({ message: "Voter not found" });
        userRole = "voter";
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

// FIX #4: verifyEmail middleware now queries the correct table based on role.
export const verifyEmail = async (req, res, next) => {
  try {
    let result;
    if (req.user.role === "candidate") {
      result = await pool.query(
        "SELECT isverified FROM candidate WHERE candidateid = $1",
        [req.user.id]
      );
    } else {
      result = await pool.query(
        "SELECT isverified FROM voter WHERE voterid = $1",
        [req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!result.rows[0].isverified) {
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
