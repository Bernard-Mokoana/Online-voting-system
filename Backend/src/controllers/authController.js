import bcrypt from "bcrypt";
import pool from "../config/db.js";
import {
  createJti,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setRefreshCookie,
  hashToken,
  resetPasswordToken,
  rotateRefreshToken,
  verifyEmailToken,
} from "../utils/token.utils.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });

    const user = await pool.query(
      `SELECT * FROM voter WHERE voter.email = $1 UNION SELECT * FROM candidate WHERE candidate.email = $1`,
      [email]
    );

    if (user.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const accessToken = signAccessToken(user);

    const jti = createJti();
    const refreshToken = signRefreshToken(user, jti);

    await persistRefreshToken({
      user,
      refreshToken,
      jti,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
    });

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        // role: user.rows[0].role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Login failed, Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const tokenHash = hashToken(token);
      const doc = await pool.query(
        `SELECT "refreshTokenID", token FROM "refreshToken" WHERE token = $1 AND isActive = TRUE`,
        [tokenHash]
      );
      if (doc.rows.length > 0) {
        await pool.query(
          `UPDATE "refreshToken" SET isActive = FALSE, "updatedAt" = NOW() WHERE "refreshTokenID" = $1`,
          [doc.rows[0].refreshTokenID]
        );
      }
    }

    res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, newPassword, token } = req.body;

    if (!password || !newPassword) {
      return res
        .status(400)
        .json({ message: "Password and new password are required" });
    }

    // This endpoint needs a user identifier (email or token) to know which user to update
    // For now, this is a placeholder - you'll need to implement proper token verification
    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    // Verify token and get user (implementation depends on your reset token logic)
    // const user = await verifyResetToken(token);
    // if (!user) {
    //   return res.status(401).json({ message: "Invalid or expired reset token" });
    // }

    // For now, returning an error as this needs proper implementation
    return res
      .status(501)
      .json({
        message:
          "Reset password functionality needs to be properly implemented",
      });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) return res.status(401).json({ message: "No refresh token" });

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const tokenHash = hashToken(token);
    const doc = await pool.query(
      `SELECT "refreshTokenID", token, "voterID", "candidateID", "expiresAt", isActive 
       FROM "refreshToken" 
       WHERE token = $1 AND isActive = TRUE`,
      [tokenHash]
    );

    if (doc.rows.length === 0) {
      return res.status(401).json({ message: "Refresh token not recognized" });
    }

    const tokenRecord = doc.rows[0];

    if (!tokenRecord.isActive) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    // Get the user from the database
    let user;
    if (tokenRecord.voterID) {
      const userResult = await pool.query(
        `SELECT * FROM voter WHERE "VoterID" = $1`,
        [tokenRecord.voterID]
      );
      user = userResult;
    } else if (tokenRecord.candidateID) {
      const userResult = await pool.query(
        `SELECT * FROM candidate WHERE "CandidateID" = $1`,
        [tokenRecord.candidateID]
      );
      user = userResult;
    } else {
      return res.status(401).json({ message: "Invalid token association" });
    }

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const result = await rotateRefreshToken(doc, user, req, res);
    return res.status(200).json({ accessToken: result.accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const user = await verifyEmailToken(token);

    if (!user)
      return res.status(401).json({ message: "Invalid or expired token" });

    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user.VoterID || user.CandidateID,
        email: user.Email,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
