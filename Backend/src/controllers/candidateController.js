import bcrypt from "bcrypt";
import pool from "../config/db.js";
import dotenv from "dotenv";
import { generateEmailVerificationToken } from "../utils/token.utils.js";
import { sendEmailVerification } from "../utils/email.utils.js";
import { uploadFile, getPublicUrl } from "../utils/supabase-storage.js";

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

    try {
      const verificationToken = await generateEmailVerificationToken(
        candidateId,
        false
      );
      await sendEmailVerification(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    const newCandidateData = newCandidate.rows[0];
    if (newCandidateData.profileimage) {
      newCandidateData.profileimage = getPublicUrl(newCandidateData.profileimage);
    }

    return res.status(201).json({
      success: true,
      message:
        "Candidate created successfully. Please check your email to verify your account.",
      data: newCandidateData,
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
    const { electionId } = req.query;

    let result;
    let electionName = null;
    if (electionId) {
      const electionResult = await pool.query(
        `SELECT "electionname" FROM election WHERE "electionid" = $1`,
        [electionId]
      );
      if (electionResult.rows.length === 0) {
        return res.status(404).json({ message: "Election not found" });
      }
      electionName = electionResult.rows[0].electionname;

      result = await pool.query(
        `SELECT * FROM candidate WHERE "electionid" = $1`,
        [electionId]
      );
    } else {
      result = await pool.query("SELECT * FROM candidate");
    }

    if (result.rows.length === 0) {
      if (electionId) {
        return res
          .status(404)
          .json({ message: "No candidates found for the specified election" });
      }
      return res.status(404).json({ message: "Candidate not found" });
    }

    const candidates = result.rows.map((candidate) => {
      if (candidate.profileimage) {
        candidate.profileimage = getPublicUrl(candidate.profileimage);
      }
      return candidate;
    });

    const response = {
      message: "Candidates fetched successfully",
      data: candidates,
    };

    if (electionName) {
      response.electionName = electionName;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getCandidateById = async (req, res) => {
  const { candidateId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM candidate WHERE "candidateid" = $1`,
      [candidateId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const candidate = result.rows[0];
    if (candidate.profileimage) {
      candidate.profileimage = getPublicUrl(candidate.profileimage);
    }

    return res.status(200).json({
      message: "Candidate successfully fetched",
      data: candidate,
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    let passwordUpdated = false;
    let fieldsUpdated = false;

    const candidate = await pool.query(
      `SELECT password FROM candidate WHERE "candidateid" = $1`,
      [candidateId]
    );

    if (candidate.rows.length === 0) {
      return res.status(404).json({ message: "candidate not found" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(
        currentPassword,
        candidate.rows[0].password
      );
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect current password" });
      }

      const hashedPassword = await bcrypt.hash(
        newPassword,
        parseInt(process.env.HASH_SALT) || 10
      );
      await pool.query(
        `UPDATE candidate SET "password" = $1 WHERE "candidateid" = $2`,
        [hashedPassword, candidateId]
      );
      passwordUpdated = true;
    }

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

    const updateFields = {
      firstname: firstName,
      lastname: lastName,
      email: email,
      biography: biography,
      profileimage: profileImageUrl,
    };

    const querySet = [];
    const queryParams = [];
    let queryIndex = 1;

    for (const [key, value] of Object.entries(updateFields)) {
      if (value) {
        querySet.push(`"${key}" = $${queryIndex++}`);
        queryParams.push(value);
      }
    }

    let updatedCandidateResult;
    if (querySet.length > 0) {
      fieldsUpdated = true;
      queryParams.push(candidateId);
      const updateQuery = `UPDATE candidate SET ${querySet.join(
        ", "
      )} WHERE "candidateid" = $${queryIndex} RETURNING *`;

      updatedCandidateResult = await pool.query(updateQuery, queryParams);
    }

    if (!fieldsUpdated && !passwordUpdated) {
      return res.status(400).json({ message: "No fields to update" });
    }

    if (!updatedCandidateResult) {
      updatedCandidateResult = await pool.query(
        `SELECT * FROM candidate WHERE "candidateid" = $1`,
        [candidateId]
      );
    }

    const updatedCandidateData = updatedCandidateResult.rows[0];
    if (updatedCandidateData.profileimage) {
      updatedCandidateData.profileimage = getPublicUrl(
        updatedCandidateData.profileimage
      );
    }

    return res.status(200).json({
      message: "Candidate updated successfully",
      data: updatedCandidateData,
    });
  } catch (error) {
    console.error("error updating candidate", error);
    return res.status(500).json({ message: "Internal server error" });
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
      `SELECT "password" FROM candidate WHERE "candidateid" = $1`,
      [candidateId]
    );

    if (candidateResults.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const isMatch = await bcrypt.compare(
      password,
      candidateResults.rows[0].password
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await pool.query(`DELETE FROM candidate WHERE "candidateid" = $1`, [
      candidateId,
    ]);

    return res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getCandidateElections = async (req, res) => {
  try {
    const candidateId = req.user.id;

    const candidateResult = await pool.query(
      `SELECT "electionid" FROM candidate WHERE "candidateid" = $1`,
      [candidateId]
    );

    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const electionId = candidateResult.rows[0].electionid;

    const electionResult = await pool.query(
      `SELECT * FROM election WHERE "electionid" = $1`,
      [electionId]
    );

    if (electionResult.rows.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    return res.status(200).json({
      message: "Election fetched successfully",
      data: electionResult.rows,
    });
  } catch (error) {
    console.error("Error fetching candidate elections:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
