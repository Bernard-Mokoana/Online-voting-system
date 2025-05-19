import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Query the admin table
    const query = "SELECT * FROM admin WHERE username = $1";
    const params = [username];
    const result = await pool.query(query, params);

    // Check if admin exists
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = result.rows[0];

    // Verify password using bcrypt
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.adminid, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Remove password before sending response
    const { password: _, ...adminData } = admin;

    res.json({
      success: true,
      token,
      admin: {
        ...adminData,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("Error during admin login:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;