import bcrypt from "bcrypt";
import pool from "../config/db.js";
import dotenv from "dotenv";
import { generateEmailVerificationToken } from "../utils/token.utils.js";
import { sendEmailVerification } from "../utils/email.utils.js";
import {
  uploadFile,
  deleteFile,
  getPublicUrl,
} from "../utils/supabase-storage.js";
import { mapVoterRow } from "../utils/mappers.js";
import { withTransaction } from "../utils/db.utils.js";

dotenv.config();

export const registerUser = async (req, res) => {
  let uploadedPath = null;
  try {
    const {
      firstName,
      lastName,
      email,
      idNumber,
      dateOfBirth,  // FIX #18: was "dataOfBirth" (typo)
      phoneNumber,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !idNumber ||
      !dateOfBirth ||
      !phoneNumber ||
      !password
    )
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const existing = await pool.query(
      `SELECT "voterid" FROM voter WHERE "email" = $1`,
      [email]
    );
    if (existing.rows.length > 0)
      return res
        .status(409)
        .json({ success: false, message: "Voter already exists" });

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.HASH_SALT) || 10
    );

    const { userRow, profileImageUrl } = await withTransaction(
      async (client) => {
        const newUser = await client.query(
          `INSERT INTO voter("firstname", "lastname", "email", "idnumber", "dateofbirth", "phonenumber", "password") 
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING "voterid", "firstname", "lastname", "email", "idnumber", "dateofbirth", "phonenumber"`,
          [
            firstName,
            lastName,
            email,
            idNumber,
            dateOfBirth,
            phoneNumber,
            hashedPassword,
          ]
        );

        const voterId = newUser.rows[0].voterid;
        let profileUrl = null;

        if (req.file) {
          uploadedPath = await uploadFile("avatars", req.file);
          profileUrl = getPublicUrl(uploadedPath);

          await client.query(
            `UPDATE voter SET "profileimageurl" = $1 WHERE "voterid" = $2`,
            [profileUrl, voterId]
          );
        }

        return { userRow: newUser.rows[0], profileImageUrl: profileUrl };
      }
    );

    try {
      const verificationToken = await generateEmailVerificationToken(
        voterId,
        true
      );
      await sendEmailVerification(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    const userData = {
      ...userRow,
      profileimageurl: profileImageUrl,
    };

    return res.status(201).json({
      success: true,
      message:
        "Voter created successfully. Please check your email to verify your account.",
      data: mapVoterRow(userData),
    });
  } catch (err) {
    if (uploadedPath) {
      try {
        await deleteFile(uploadedPath);
      } catch (cleanupError) {
        console.error("Registration cleanup error:", cleanupError);
      }
    }

    console.error("Registration error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Registration failed" });
  }
};

export const getVoterById = async (req, res) => {
  const { voterId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM voter WHERE "voterid" = $1`,
      [voterId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Voter not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Voter fetched successfully",
      data: mapVoterRow(result.rows[0]),
    });
  } catch (error) {
    console.error("Profile fetch error: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getAllVoters = async (req, res) => {
  try {
    const voters = await pool.query(`
      SELECT "voterid", "firstname", "lastname", "email", "idnumber", "dateofbirth", "phonenumber", "hasvoted", "isverified", "createdat"
      FROM voter
    `);

    return res.status(200).json({
      success: true,
      message: "Voters fetched successfully",
      data: voters.rows.map(mapVoterRow),
    });
  } catch (error) {
    console.error("Voters fetch error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateVoter = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      currentPassword,
      newPassword,
    } = req.body;

    const voterId = req.user?.id;
    if (!voterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const voter = await pool.query(
      `SELECT "password" FROM voter WHERE "voterid" = $1`,
      [voterId]
    );

    if (voter.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Voter not found" });
    }

    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(
        currentPassword,
        voter.rows[0].password
      );

      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(
        newPassword,
        parseInt(process.env.HASH_SALT) || 10
      );

      await pool.query(
        `UPDATE voter SET "password" = $1 WHERE "voterid" = $2`,
        [hashedPassword, voterId]
      );
    }

    if (firstName || lastName || email || phoneNumber) {
      await pool.query(
        `UPDATE voter
         SET "firstname" = COALESCE($1, "firstname"),
             "lastname" = COALESCE($2, "lastname"),
             "email" = COALESCE($3, "email"),
             "phonenumber" = COALESCE($4, "phonenumber")
         WHERE "voterid" = $5`,
        [firstName, lastName, email, phoneNumber, voterId]
      );
    }

    try {
      // FIX #7: Use lowercase table/column names — PascalCase quoted identifiers fail
      await pool.query(
        `INSERT INTO voterauditlog (voterid, actiontype, actiondetails)
         VALUES ($1, $2, $3)`,
        [
          voterId,
          "profile_update",
          `Profile updated at ${new Date().toISOString()}`,
        ]
      );
    } catch (auditError) {
      console.error("Audit log error:", auditError);
    }

    return res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    const voterId = req.user?.id;
    if (!voterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const voterPassword = await pool.query(
      `SELECT "password" FROM voter WHERE "voterid" = $1`,
      [voterId]
    );

    if (voterPassword.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Voter not found" });
    }

    const comparedPasswords = await bcrypt.compare(
      password,
      voterPassword.rows[0].password
    );

    if (!comparedPasswords) {
      return res
        .status(401)
        .json({ success: false, message: "Password is incorrect" });
    }

    // FIX #6: Removed explicit deletes of Vote and VoterAuditLog with wrong-case
    // quoted identifiers ("Vote", "VoterAuditLog"). The FK constraints have
    // ON DELETE CASCADE set, so deleting the voter row handles them automatically.
    await pool.query(`DELETE FROM voter WHERE "voterid" = $1`, [voterId]);

    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account deletion error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//   // Get user's voting history
//   getVotingHistory: async (req, res) => {
//     try {
//       const result = await pool.query(
//         `SELECT v.created_at, c.first_name, c.last_name, c.party, e.title as election_title
//          FROM votes v
//          JOIN candidates c ON v.candidate_id = c.id
//          JOIN elections e ON v.election_id = e.id
//          WHERE v.user_id = $1
//          ORDER BY v.created_at DESC`,
//         [req.user.id]
//       );

//       res.json(result.rows);
//     } catch (error) {
//       console.error("Voting history fetch error:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   },
