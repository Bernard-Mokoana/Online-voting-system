import bcrypt from "bcrypt";
import pool from "../config/db.js";
import {
  createJti,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setRefreshCookie,
  hashToken,
  rotateRefreshToken,
  verifyEmailToken,
  generateResetPasswordToken,
  verifyResetPasswordToken,
} from "../utils/token.utils.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isAdminLogin = req.baseUrl.includes("/admin");

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });

    let user = null;
    let role = null;

    if (isAdminLogin) {
      const adminResult = await pool.query(
        `SELECT * FROM admin WHERE "username" = $1`,
        [email]
      );
      if (adminResult.rows.length > 0) {
        user = adminResult;
        role = "admin";
      }
    } else {
      let voterResult = await pool.query(
        `SELECT * FROM voter WHERE "email" = $1`,
        [email]
      );

      if (voterResult.rows.length > 0) {
        user = voterResult;
        role = "voter";
      } else {
        let candidateResult = await pool.query(
          `SELECT * FROM candidate WHERE "email" = $1`,
          [email]
        );
        if (candidateResult.rows.length > 0) {
          user = candidateResult;
          role = "candidate";
        }
      }
    }

    if (!user || user.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const isVerified = role === "voter" ? user.rows[0].IsVerified : false;

    const accessToken = signAccessToken(user.rows[0], role);

    const jti = createJti();
    const refreshToken = signRefreshToken(user.rows[0], jti, role);

    await persistRefreshToken({
      user: user.rows[0],
      refreshToken,
      jti,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
      role,
    });

    setRefreshCookie(res, refreshToken);

    const response = {
      message: "Login successful",
      accessToken,
      user: {
        id:
          user.rows[0].voterid ||
          user.rows[0].candidateid ||
          user.rows[0].adminid,
        email: user.rows[0].email || user.rows[0].username,
        firstName: user.rows[0].firstname,
        isVerified,
        role,
      },
    };

    if (!isVerified && role === "voter") {
      response.warning =
        "Please verify your email address to access all features.";
    }

    return res
      .status(200)
      .json({ message: "User login successful", data: response });
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
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      return res
        .status(400)
        .json({ message: "Password and new password are required" });
    }

    const token = generateResetPasswordToken();

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    const user = await verifyResetPasswordToken(token);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid or expired reset token" });
    }

    return res.status(200).json({ message: "Password changed successfully" });
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
      `SELECT "refreshTokenid", token, "voterid", "candidateid", "adminid", "expiresat", isactive 
       FROM "refreshtoken" 
       WHERE token = $1 AND isactive = TRUE`,
      [tokenHash]
    );

    if (doc.rows.length === 0) {
      return res.status(401).json({ message: "Refresh token not recognized" });
    }

    const tokenRecord = doc.rows[0];

    if (!tokenRecord.isactive) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    if (new Date(tokenRecord.expiresat) < new Date()) {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    let user;
    const role = decoded.role;
    if (tokenRecord.voterid) {
      const userResult = await pool.query(
        `SELECT * FROM voter WHERE "voterid" = $1`,
        [tokenRecord.voterid]
      );
      user = userResult.rows[0];
    } else if (tokenRecord.candidateid) {
      const userResult = await pool.query(
        `SELECT * FROM candidate WHERE "candidateid" = $1`,
        [tokenRecord.candidateid]
      );
      user = userResult.rows[0];
    } else if (tokenRecord.adminid) {
      const userResult = await pool.query(
        `SELECT * FROM admin WHERE "adminid" = $1`,
        [tokenRecord.adminid]
      );
      user = userResult.rows[0];
    } else {
      return res.status(401).json({ message: "Invalid token association" });
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const result = await rotateRefreshToken(doc.rows[0], user, req, res, role);
    return res.status(200).json({ accessToken: result.accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const token = req.query.token || req.body.token;

  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const user = await verifyEmailToken(token);

    if (!user)
      return res.status(401).json({ message: "Invalid or expired token" });

    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user.voterid || user.candidateid,
        email: user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
