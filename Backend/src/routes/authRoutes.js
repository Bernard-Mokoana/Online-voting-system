import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (
    !password ||
    !role ||
    (role === "admin" && !username) ||
    (role === "voter" && !email)
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let query, params;
    if (role === "admin") {
      query = "SELECT * FROM admin WHERE username = $1";
      params = [username];
    } else if (role === "voter") {
      query = "SELECT * FROM voter WHERE email = $1";
      params = [email];
    } else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { password: _, ...userData } = user;

    res.json({
      success: true,
      user: {
        ...userData,
        role,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
