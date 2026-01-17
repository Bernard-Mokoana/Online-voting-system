import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

const REFRESH_TTL_SEC = 60 * 60 * 24 * 7;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createJti() {
  return crypto.randomBytes(16).toString("hex");
}

function signAccessToken(user, role) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.EXPIRES_IN || "15m";

  const payload = {
    id: user.voterid || user.candidateid || user.adminid,
    email: user.email || user.username,
    role: role,
  };

  return jwt.sign(payload, secret, { expiresIn });
}

function signRefreshToken(user, jti, role) {
  const refreshTokenSecret = process.env.REFRESH_JWT_SECRET;

  const payload = {
    id: user.voterid || user.candidateid || user.adminid,
    jti,
    role,
  };

  const token = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: REFRESH_TTL_SEC,
  });
  return token;
}

async function persistRefreshToken({ user, refreshToken, role }) {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000);

  let query = "";
  let values = [];

  if (role === "voter") {
    query = `INSERT INTO refreshToken (voterID, token, expiresAt, createdAt, updatedAt) 
             VALUES ($1, $2, $3, NOW(), NOW())`;
    values = [user.voterid, tokenHash, expiresAt];
  } else if (role === "candidate") {
    query = `INSERT INTO refreshToken (candidateID, token, expiresAt, createdAt, updatedAt)
             VALUES ($1, $2, $3, NOW(), NOW())`;
    values = [user.candidateid, tokenHash, expiresAt];
  } else if (role === "admin") {
    query = `INSERT INTO refreshToken (adminID, token, expiresAt, createdAt, updatedAt)
             VALUES ($1, $2, $3, NOW(), NOW())`;
    values = [user.adminid, tokenHash, expiresAt];
  }

  if (query) {
    await pool.query(query, values);
  } else {
    throw new Error("Invalid user role for persisting refresh token.");
  }
}

function setRefreshCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/v1/auth/refresh",
    maxAge: REFRESH_TTL_SEC * 1000,
  });
}

async function rotateRefreshToken(oldDoc, user, req, res, role) {
  await pool.query(
    `UPDATE refreshToken SET isActive = FALSE, updatedAt = NOW() WHERE "refreshTokenID" = $1`,
    [oldDoc.refreshtokenid]
  );

  const newJti = createJti();
  const newAccess = signAccessToken(user, role);
  const newRefresh = signRefreshToken(user, newJti, role);

  await persistRefreshToken({
    user,
    refreshToken: newRefresh,
    jti: newJti,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || "",
    role,
  });
  setRefreshCookie(res, newRefresh);
  return { accessToken: newAccess };
}

async function generateResetPasswordToken() {
  const token = crypto.randomBytes(32).toString("hex");
}

async function verifyResetPasswordToken(token) {}

async function generateEmailVerificationToken(userId, isVoter = true) {
  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (isVoter) {
    await pool.query(
      `INSERT INTO emailVerificationToken (voterID, candidateID, token, expiredAt, createdAt, updatedAt)
       VALUES ($1, NULL, $2, $3, NOW(), NOW())`,
      [userId, token, expiresAt]
    );
  } else {
    await pool.query(
      `INSERT INTO emailVerificationToken (voterID, candidateID, token, expiredAt, createdAt, updatedAt)
       VALUES (NULL, $1, $2, $3, NOW(), NOW())`,
      [userId, token, expiresAt]
    );
  }

  return token;
}

async function verifyEmailToken(token) {
  const client = await pool.connect();

  try {
    await client.query(`BEGIN`);

    const tokenResult = await client.query(
      `SELECT voterID, candidateID, token, isActive, expiredAt 
       FROM emailVerificationToken
       WHERE token = $1 AND "isActive" = TRUE AND expiredAt > NOW()`,
      [token]
    );

    const tokenRecord = tokenResult.rows[0];

    if (!tokenRecord) {
      await client.query(`ROLLBACK`);
      return null;
    }

    const voterId = tokenRecord.voterid;
    const candidateId = tokenRecord.candidateid;

    if (voterId) {
      const updateResult = await client.query(
        `UPDATE voter SET IsVerified = TRUE WHERE "VoterID" = $1 RETURNING *`,
        [voterId]
      );

      if (updateResult.rows.length === 0) {
        await client.query(`ROLLBACK`);
        console.error(`Voter with ID ${voterId} not found`);
        return null;
      }
    }

    if (candidateId) {
      await client.query(
        `UPDATE candidate SET IsVerified = TRUE WHERE "CandidateID" = $1`,
        [candidateId]
      );
    }

    await client.query(
      `UPDATE "emailVerificationToken" SET "isActive" = FALSE WHERE token = $1`,
      [token]
    );

    let user;
    if (voterId) {
      const userResult = await client.query(
        `SELECT * FROM voter WHERE "VoterID" = $1`,
        [voterId]
      );
      user = userResult.rows[0];
    } else if (candidateId) {
      const userResult = await client.query(
        `SELECT * FROM candidate WHERE "CandidateID" = $1`,
        [candidateId]
      );
      user = userResult.rows[0];
    }

    await client.query(`COMMIT`);
    return user || null;
  } catch (error) {
    await client.query(`ROLLBACK`);
    console.error("Error verifying email token:", error);
    throw error;
  } finally {
    client.release();
  }
}

export {
  hashToken,
  createJti,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setRefreshCookie,
  rotateRefreshToken,
  generateResetPasswordToken,
  verifyResetPasswordToken,
  generateEmailVerificationToken,
  verifyEmailToken,
};
