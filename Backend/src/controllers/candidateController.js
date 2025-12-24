import bcrypt from "bcrypt";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();
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

    const hashedPassword = await bcrypt.hash(password, process.env.HASH_SALT);

    const newUser = await pool.query(
      `INSERT INTO users (firstName,
      lastName,
      email,
      idNumber,
      position,
      biography,
      hashedPassword,) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, firstName,
      lastName,
      email,
      idNumber,
      position,
      biography,
      hashedPassword,`,
      [
        firstName,
        lastName,
        email,
        idNumber,
        position,
        biography,
        hashedPassword,
      ]
    );

    return res.status(201).json({
      success: true,
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
};

export const getCandidates = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM candidate");

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Candidate not found" });

    return res
      .status(200)
      .json({ message: "Candidates fetched successfully", data: result.rows });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getCandidateById = async (req, res) => {
  const { candidateId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM candidate WHERE id = $1", [
      candidateId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    return res.status(200).json({ message: "Candidate successfully fetched" });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      biography,
      currentPassword,
      newPassword,
    } = req.body;

    const candidate = await pool.query(
      `SELECT password FROM candidate WHERE candidateID = $1`,
      [id, password]
    );

    const comparedPassword = await bcrypt.compare(
      currentPassword,
      candidate.password
    );

    newPassword = await bcrypt.hash(currentPassword, process.env.HASH_SALT);

    if (comparedPassword) {
      await pool.query(`UPDATE candidate SET password = $1`, [newPassword]);
    } else {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const updateCandidate = await pool.query(
      `UPDATE candidate SET firstName = $2,
      lastName = $3,
      email = $4,
      biography = $5`,
      [firstName, lastName, email, biography]
    );

    return res.status(200).json({
      message: "Candidate updated successfully",
      data: updateCandidate.rows,
    });
  } catch (error) {
    console.error("error updating candidate", error);
    return res.status(500).json({ message: "Internal server errort" });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const { password } = req.body;

    if (password) {
      await pool.query(`DELETE FROM candidate WHERE password = $1`, [password]);
    } else {
      return res.status(400).json({ message: "Incorrect password" });
    }

    return res.status(200).json({ message: "candidate deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
