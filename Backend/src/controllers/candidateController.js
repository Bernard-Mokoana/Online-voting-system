import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";

export const registerCandidate = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      idNumber,
      position,
      biography,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !idNumber ||
      !position ||
      !biography ||
      !password
    )
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });

    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [
      email,
    ]);
    if (existing.rows.length > 0)
      return res
        .status(409)
        .json({ success: false, error: "User already exists" });

    const saltRound = 12;

    const hashedPassword = await bcrypt.hash(password, saltRound);

    const newUser = await pool.query(
      `INSERT INTO users (email, passwordhash, role) VALUES ($1, $2, $3) RETURNING id, email, role`,
      [email, hashedPassword, role]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      token,
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
};

// import pool from "../config/db.js"; // Assuming you're using a database connection pool

// // Get all candidates
// export const getCandidates = async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM candidate");
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error fetching candidates:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // Get a candidate by ID
// export const getCandidateById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query("SELECT * FROM candidate WHERE id = $1", [
//       id,
//     ]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error("Error fetching candidate:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
