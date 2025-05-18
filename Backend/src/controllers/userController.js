import pool from "../config/database.js";
import bcrypt from "bcrypt";

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, first_name, last_name, email, id_number, 
         date_of_birth, phone_number, role, created_at
         FROM users WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, phoneNumber, currentPassword, newPassword } =
        req.body;

      // If updating password, verify current password
      if (newPassword) {
        const user = await pool.query(
          "SELECT password FROM users WHERE id = $1",
          [req.user.id]
        );

        if (!(await bcrypt.compare(currentPassword, user.rows[0].password))) {
          return res
            .status(401)
            .json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
          hashedPassword,
          req.user.id,
        ]);
      }

      // Update other profile fields
      await pool.query(
        `UPDATE users 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone_number = COALESCE($3, phone_number)
         WHERE id = $4`,
        [firstName, lastName, phoneNumber, req.user.id]
      );

      // Log profile update
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, ip_address)
         VALUES ($1, $2, $3)`,
        [req.user.id, "profile_update", req.ip]
      );

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Delete user account
  deleteAccount: async (req, res) => {
    try {
      const { password } = req.body;

      // Verify password before deletion
      const user = await pool.query(
        "SELECT password FROM users WHERE id = $1",
        [req.user.id]
      );

      if (!(await bcrypt.compare(password, user.rows[0].password))) {
        return res.status(401).json({ message: "Password is incorrect" });
      }

      // Delete user's votes
      await pool.query("DELETE FROM votes WHERE user_id = $1", [req.user.id]);

      // Delete user's verification tokens
      await pool.query("DELETE FROM verification_tokens WHERE user_id = $1", [
        req.user.id,
      ]);

      // Delete user's audit logs
      await pool.query("DELETE FROM audit_logs WHERE user_id = $1", [
        req.user.id,
      ]);

      // Delete user
      await pool.query("DELETE FROM users WHERE id = $1", [req.user.id]);

      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get user's voting history
  getVotingHistory: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT v.created_at, c.first_name, c.last_name, c.party, e.title as election_title
         FROM votes v
         JOIN candidates c ON v.candidate_id = c.id
         JOIN elections e ON v.election_id = e.id
         WHERE v.user_id = $1
         ORDER BY v.created_at DESC`,
        [req.user.id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Voting history fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Admin: Get all users
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, first_name, last_name, email, id_number, 
               date_of_birth, phone_number, role, created_at
        FROM users
        WHERE 1=1
      `;
      const queryParams = [];

      if (role) {
        queryParams.push(role);
        query += ` AND role = $${queryParams.length}`;
      }

      if (search) {
        queryParams.push(`%${search}%`);
        query += ` AND (
          first_name ILIKE $${queryParams.length} OR
          last_name ILIKE $${queryParams.length} OR
          email ILIKE $${queryParams.length} OR
          id_number ILIKE $${queryParams.length}
        )`;
      }

      query += ` ORDER BY created_at DESC LIMIT $${
        queryParams.length + 1
      } OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);

      const result = await pool.query(query, queryParams);

      // Get total count for pagination
      const countQuery = query
        .replace(/SELECT.*FROM/, "SELECT COUNT(*) FROM")
        .split("ORDER BY")[0];
      const countResult = await pool.query(
        countQuery,
        queryParams.slice(0, -2)
      );

      res.json({
        users: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      });
    } catch (error) {
      console.error("Users fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Admin: Update user role
  updateUserRole: async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      await pool.query("UPDATE users SET role = $1 WHERE id = $2", [
        role,
        userId,
      ]);

      // Log role update
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, details, ip_address)
         VALUES ($1, $2, $3, $4)`,
        [
          req.user.id,
          "role_update",
          { targetUserId: userId, newRole: role },
          req.ip,
        ]
      );

      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Role update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default userController;
