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

function signAccessToken(user) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.EXPIRES_IN || "15m";

  const payload = {
    id: user.rows[0].id.toString(),
    email: user.rows[0].email,
  };

  return jwt.sign(payload, secret, { expiresIn });
}

function signRefreshToken(user, jti) {
  const refreshTokenSecret = process.env.REFRESH_JWT_SECRET;

  const payload = {
    id: user.rows[0].id.toString(),
    jti,
  };

  const token = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: REFRESH_TTL_SEC,
  });
  return token;
}

async function persistRefreshToken({ user, refreshToken, jti, ip, userAgent }) {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000);

  const userRow = user.rows[0];

  const isVoter =
    userRow.HasVoted !== undefined || userRow.IsVerified !== undefined;

  let voterId = null;
  let candidateId = null;

  const idValue = userRow.VoterID || userRow.voterid || userRow.voterID;

  if (!idValue) {
    throw new Error("Unable to determine user ID from query result");
  }

  if (isVoter) {
    // User is a voter - the ID value is the VoterID
    voterId = idValue;
  } else {
    // User is a candidate - the ID in VoterID column is actually CandidateID
    // Verify this by checking if it exists in candidate table
    const candidateCheck = await pool.query(
      `SELECT "CandidateID" FROM candidate WHERE "CandidateID" = $1`,
      [idValue]
    );

    if (candidateCheck.rows.length > 0) {
      candidateId = idValue;
    } else {
      // Fallback: try to find candidate by email
      const candidateByEmail = await pool.query(
        `SELECT "CandidateID" FROM candidate WHERE "IdNumber" = $1`,
        [userRow.IdNumber]
      );
      if (candidateByEmail.rows.length > 0) {
        candidateId = candidateByEmail.rows[0].CandidateID;
      } else {
        throw new Error("Unable to determine CandidateID for candidate user");
      }
    }
  }

  // Insert with NULL for the ID that doesn't apply
  // Schema should allow NULL for one of voterID or candidateID
  await pool.query(
    `INSERT INTO "refreshToken" ("voterID", "candidateID", token, "expiresAt", "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, $4, NOW(), NOW())`,
    [voterId, candidateId, tokenHash, expiresAt]
  );
}

function setRefreshCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/api/v1/auth/refresh",
    maxAge: REFRESH_TTL_SEC * 1000,
  });
}

async function rotateRefreshToken(oldDoc, user, req, res) {
  // Mark old token as inactive
  await pool.query(
    `UPDATE refreshToken SET isActive = FALSE, "updatedAt" = NOW() WHERE "refreshTokenID" = $1`,
    [oldDoc.rows[0].refreshTokenID]
  );

  const newJti = createJti();
  const newAccess = signAccessToken(user);
  const newRefresh = signRefreshToken(user, newJti);

  await persistRefreshToken({
    user,
    refreshToken: newRefresh,
    jti: newJti,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || "",
  });
  setRefreshCookie(res, newRefresh);
  return { accessToken: newAccess };
}

async function resetPasswordToken() {}

async function verifyEmailToken(token) {
  const client = await pool.connect();

  try {
    await client.query(`BEGIN`);

    const tokenResult = await client.query(
      `SELECT * FROM emailVerificationToken WHERE token = $1 AND isActive = TRUE AND "expiredAt" > NOW()`,
      [token]
    );

    const tokenRecord = tokenResult.rows[0];

    if (!tokenRecord) {
      await client.query(`ROLLBACK`);
      return null;
    }

    // Update voter or candidate verification status
    if (tokenRecord.voterID) {
      await client.query(
        `UPDATE voter SET "IsVerified" = TRUE WHERE "VoterID" = $1`,
        [tokenRecord.voterID]
      );
    }

    if (tokenRecord.candidateID) {
      // Candidates might not have IsVerified field, adjust if needed
      // await client.query(
      //   `UPDATE candidate SET "IsVerified" = TRUE WHERE "CandidateID" = $1`,
      //   [tokenRecord.candidateID]
      // );
    }

    await client.query(
      `UPDATE emailVerificationToken SET isActive = FALSE WHERE token = $1`,
      [token]
    );

    let user;
    if (tokenRecord.voterID) {
      const userResult = await client.query(
        `SELECT * FROM voter WHERE "VoterID" = $1`,
        [tokenRecord.voterID]
      );
      user = userResult.rows[0];
    } else if (tokenRecord.candidateID) {
      const userResult = await client.query(
        `SELECT * FROM candidate WHERE "CandidateID" = $1`,
        [tokenRecord.candidateID]
      );
      user = userResult.rows[0];
    }

    await client.query(`COMMIT`);
    return user || null;
  } catch (error) {
    await client.query(`ROLLBACK`);
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
  resetPasswordToken,
  verifyEmailToken,
};
