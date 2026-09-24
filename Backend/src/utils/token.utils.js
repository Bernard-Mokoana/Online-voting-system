import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

const REFRESH_TTL_SEC = 60 * 60 * 24 * 7; // 7 days

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
    query = `INSERT INTO refreshtoken (voterid, token, expiresat, createdat, updatedat)
             VALUES ($1, $2, $3, NOW(), NOW())`;
    values = [user.voterid, tokenHash, expiresAt];
  } else if (role === "candidate") {
    query = `INSERT INTO refreshtoken (candidateid, token, expiresat, createdat, updatedat)
             VALUES ($1, $2, $3, NOW(), NOW())`;
    values = [user.candidateid, tokenHash, expiresAt];
  } else if (role === "admin") {
    query = `INSERT INTO refreshtoken (adminid, token, expiresat, createdat, updatedat)
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
    `UPDATE refreshtoken SET isactive = FALSE, updatedat = NOW() WHERE refreshtokenid = $1`,
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

// FIX #1: generateResetPasswordToken now accepts userId + isVoter,
// persists the token to DB, and RETURNS it.
async function generateResetPasswordToken(userId, isVoter = true) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  if (isVoter) {
    await pool.query(
      `INSERT INTO resetpasswordtoken (voterid, token, expiredat, createdat, updatedat)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [userId, token, expiresAt]
    );
  } else {
    await pool.query(
      `INSERT INTO resetpasswordtoken (candidateid, token, expiredat, createdat, updatedat)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [userId, token, expiresAt]
    );
  }

  return token; // FIX: was missing this return statement
}

// FIX #1: verifyResetPasswordToken is now fully implemented.
async function verifyResetPasswordToken(token) {
  const result = await pool.query(
    `SELECT resetpasswordid, voterid, candidateid
     FROM resetpasswordtoken
     WHERE token = $1 AND isactive = TRUE AND expiredat > NOW()`,
    [token]
  );

  if (!result.rows[0]) return null;

  const record = result.rows[0];

  // Mark token as used
  await pool.query(
    `UPDATE resetpasswordtoken SET isactive = FALSE, updatedat = NOW()
     WHERE resetpasswordid = $1`,
    [record.resetpasswordid]
  );

  return record; // { voterid, candidateid }
}

// FIX #8: verifyEmailToken now uses consistent lowercase SQL identifiers.
async function generateEmailVerificationToken(userId, isVoter = true) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  if (isVoter) {
    await pool.query(
      `INSERT INTO emailverificationtoken (voterid, candidateid, token, expiredat, createdat, updatedat)
       VALUES ($1, NULL, $2, $3, NOW(), NOW())`,
      [userId, token, expiresAt]
    );
  } else {
    await pool.query(
      `INSERT INTO emailverificationtoken (voterid, candidateid, token, expiredat, createdat, updatedat)
       VALUES (NULL, $1, $2, $3, NOW(), NOW())`,
      [userId, token, expiresAt]
    );
  }

  return token;
}

// FIX #8: All SQL identifiers are now lowercase — no more "VoterID", "CandidateID" etc.
async function verifyEmailToken(token) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // FIX: was using "isActive" (quoted, case-sensitive) — now unquoted lowercase
    const tokenResult = await client.query(
      `SELECT voterid, candidateid, token, isactive, expiredat
       FROM emailverificationtoken
       WHERE token = $1 AND isactive = TRUE AND expiredat > NOW()`,
      [token]
    );

    const tokenRecord = tokenResult.rows[0];

    if (!tokenRecord) {
      await client.query("ROLLBACK");
      return null;
    }

    const voterId = tokenRecord.voterid;
    const candidateId = tokenRecord.candidateid;

    if (voterId) {
      // FIX: was using "VoterID" (quoted PascalCase) — now lowercase
      const updateResult = await client.query(
        `UPDATE voter SET isverified = TRUE WHERE voterid = $1 RETURNING *`,
        [voterId]
      );

      if (updateResult.rows.length === 0) {
        await client.query("ROLLBACK");
        console.error(`Voter with ID ${voterId} not found`);
        return null;
      }
    }

    if (candidateId) {
      // FIX: was using "CandidateID" (quoted PascalCase) — now lowercase
      await client.query(
        `UPDATE candidate SET isverified = TRUE WHERE candidateid = $1`,
        [candidateId]
      );
    }

    // FIX: table and column names now lowercase
    await client.query(
      `UPDATE emailverificationtoken SET isactive = FALSE WHERE token = $1`,
      [token]
    );

    let user;
    if (voterId) {
      // FIX: was using "VoterID" (quoted PascalCase)
      const userResult = await client.query(
        `SELECT * FROM voter WHERE voterid = $1`,
        [voterId]
      );
      user = userResult.rows[0];
    } else if (candidateId) {
      // FIX: was using "CandidateID" (quoted PascalCase)
      const userResult = await client.query(
        `SELECT * FROM candidate WHERE candidateid = $1`,
        [candidateId]
      );
      user = userResult.rows[0];
    }

    await client.query("COMMIT");
    return user || null;
  } catch (error) {
    await client.query("ROLLBACK");
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
