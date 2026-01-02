import bcrypt from "bcrypt";
import pool from "../config/db.js";
import dotenv from "dotenv";
import { generateEmailVerificationToken } from "../utils/token.utils.js";
import { sendEmailVerification } from "../utils/email.utils.js";
import { uploadFile } from "../utils/supabase-storage.js";

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
      electionId,
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

    const electionExists = await pool.query(
      `SELECT "electionid" FROM election WHERE "electionid" = $1`,
      [electionId]
    );
    if (electionExists.rows.length === 0)
      return res
        .status(400)
        .json({ success: false, error: "Invalid election ID" });

    const existing = await pool.query(
      `SELECT "candidateid" FROM candidate WHERE "email" = $1 OR "idnumber" = $2`,
      [email, idNumber]
    );
    if (existing.rows.length > 0)
      return res
        .status(409)
        .json({ success: false, error: "Candidate already exists" });

    let profileImageUrl = null;
    if (req.file) {
      try {
        profileImageUrl = await uploadFile("candidates", req.file);
      } catch (uploadError) {
        console.error("Image upload failed: ", uploadError);
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload profile image" });
      }
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.HASH_SALT) || 10
    );

    const newCandidate = await pool.query(
      `INSERT INTO candidate ("firstname", "lastname", "idnumber", "position", "biography", "email", "password", "electionid", "profileimage")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING "candidateid", "firstname", "lastname", "email", "idnumber", "position", "profileimage"`,
      [
        firstName,
        lastName,
        idNumber,
        position,
        biography,
        email,
        hashedPassword,
        electionId,
        profileImageUrl,
      ]
    );

    const candidateId = newCandidate.rows[0].candidateid;

    console.log(candidateId);

    try {
      const verificationToken = await generateEmailVerificationToken(
        candidateId,
        false
      );
      await sendEmailVerification(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return res.status(201).json({
      success: true,
      message:
        "Candidate created successfully. Please check your email to verify your account.",
      data: newCandidate.rows[0],
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Registration failed" });
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
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM candidate WHERE id = $1", [
      id,
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

    const candidateId = req.user.id;

    const candidate = await pool.query(
      `SELECT password FROM candidate WHERE candidateID = $1`,
      [candidateId]
    );

    if (candidate.rows.length === 0) {
      return res.status(404).json({ message: "candidate not found" });
    }

    let imageUpdateQuery = "";
    const queryParams = [firstName, lastName, biography, email, candidateId];

    if (req.file) {
      try {
        const profileImageUrl = await uploadFile("candidates", req.file);
        queryParams.push(profileImageUrl);
      } catch (uploadError) {
        return res
          .status(500)
          .json({ message: "Image upload failed: ", uploadError });
      }
    }

    const hasImage = queryParams.length === 6;

    if (currentPassword) {
      const isMatch = await bcrypt.compare(
        currentPassword,
        candidate.rows[0].Password
      );
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect current password" });
      }
    }

    if (newPassword) {
      const hashedPassword = bcrypt.hash(
        currentPassword,
        parseInt(process.env.HASH_SALT) || 10
      );
      await pool.query(
        `UPDATE candidate SET "password" = $1 WHERE "candidateid" = $2`,
        [hashedPassword, candidateId]
      );
    }

    const updateCandidate = pool.query(
      `UPDATE candidate SET "firstName" = COALESCE($1, "firstname""),
      "lastname" = COALESCE($2, "lastname"),
      "email" = COALESCE($3, "email"),
      "biography" = COALESCE($4, "biography"),
      ${hasImage ? `, "ProfileImage" = $6` : " "},
      WHERE "candidateid" = $5 RETURNING *`,
      queryParams
    );

    return res.status(200).json({
      message: "Candidate updated successfully",
      data: updateCandidate.rows[0],
    });
  } catch (error) {
    console.error("error updating candidate", error);
    return res.status(500).json({ message: "Internal server errort" });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const { password } = req.body;
    const candidateId = req.user.id;

    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required to delete the password" });
    }

    const candidateResults = await pool.query(
      `SELECT 'password FROM candidate WHERE "candidateid = $1`,
      [candidateId]
    );

    if (candidateResults.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const isMatch = await bcrypt.compare(
      password,
      candidateResults.rows[0].Password
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await pool.query(`DELETE FROM candidate WHERE "candidateid" = $1`, [
      candidateId,
    ]);

    return res.status(200).json({ message: "candidate deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
