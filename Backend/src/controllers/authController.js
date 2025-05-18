import pool from "../database/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authController = {
  // Register a new user (voter or admin)
  register: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        idNumber,
        password,
        dateOfBirth,
        phoneNumber,
        role = "voter",
        username, // for admin
      } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      if (role === "admin") {
        // Check if admin exists
        const adminExists = await pool.query(
          "SELECT * FROM admin WHERE username = $1",
          [username]
        );
        if (adminExists.rows.length > 0) {
          return res.status(400).json({ message: "Admin already exists" });
        }
        await pool.query(
          "INSERT INTO admin (username, password) VALUES ($1, $2)",
          [username, hashedPassword]
        );
        return res
          .status(201)
          .json({ message: "Admin registered successfully" });
      } else {
        // Check if voter exists
        const voterExists = await pool.query(
          "SELECT * FROM voter WHERE email = $1 OR idnumber = $2",
          [email, idNumber]
        );
        if (voterExists.rows.length > 0) {
          return res.status(400).json({ message: "Voter already exists" });
        }
        await pool.query(
          `INSERT INTO voter (
            firstname, lastname, email, idnumber, password,
            dateofbirth, phonenumber, isverified
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            firstName,
            lastName,
            email,
            idNumber,
            hashedPassword,
            dateOfBirth,
            phoneNumber,
            true, // isVerified
          ]
        );
        return res
          .status(201)
          .json({ message: "Voter registered successfully" });
      }
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Login user (admin or voter)
  login: async (req, res) => {
    try {
      const { email, password, role } = req.body;

      let user;
      if (role === "admin") {
        const result = await pool.query(
          "SELECT * FROM admin WHERE username = $1",
          [email]
        );
        user = result.rows[0];
        if (!user)
          return res.status(401).json({ message: "Invalid credentials" });
        if (!(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      } else {
        const result = await pool.query(
          "SELECT * FROM voter WHERE email = $1",
          [email]
        );
        user = result.rows[0];
        if (!user)
          return res.status(401).json({ message: "Invalid credentials" });
        if (!(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!user.isverified) {
          return res
            .status(403)
            .json({ message: "Please verify your email first" });
        }
      }

      const token = jwt.sign(
        { id: user.adminid || user.voterid, role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.adminid || user.voterid,
          firstName: user.firstname,
          lastName: user.lastname,
          email: user.email || user.username,
          role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      const result = await pool.query(
        "SELECT * FROM verification_tokens WHERE token = $1 AND type = $2 AND expires_at > NOW()",
        [refreshToken, "refresh_token"]
      );

      if (result.rows.length === 0) {
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }

      const user = await pool.query("SELECT * FROM users WHERE id = $1", [
        result.rows[0].user_id,
      ]);

      const newToken = jwt.sign(
        { id: user.rows[0].id, role: user.rows[0].role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({ token: newToken });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Verify email
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;

      const result = await pool.query(
        "SELECT * FROM verification_tokens WHERE token = $1 AND type = $2 AND expires_at > NOW()",
        [token, "email_verification"]
      );

      if (result.rows.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid or expired verification token" });
      }

      await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [
        result.rows[0].user_id,
      ]);

      await pool.query("DELETE FROM verification_tokens WHERE token = $1", [
        token,
      ]);

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const resetToken = jwt.sign(
        { userId: result.rows[0].id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      await pool.query(
        `INSERT INTO verification_tokens (user_id, token, type, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
        [result.rows[0].id, resetToken, "password_reset"]
      );

      // TODO: Send password reset email

      res.json({ message: "Password reset instructions sent to your email" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const result = await pool.query(
        "SELECT * FROM verification_tokens WHERE token = $1 AND type = $2 AND expires_at > NOW()",
        [token, "password_reset"]
      );

      if (result.rows.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
        hashedPassword,
        result.rows[0].user_id,
      ]);

      await pool.query("DELETE FROM verification_tokens WHERE token = $1", [
        token,
      ]);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default authController;
