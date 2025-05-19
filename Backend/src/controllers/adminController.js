import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminController = {
  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      // Check if admin exists
      const result = await pool.query(
        "SELECT * FROM Admin WHERE Username = $1",
        [username]
      );
      if (result.rows.length === 0) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      const admin = result.rows[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { adminId: admin.adminid },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.json({
        token,
        admin: { id: admin.adminid, username: admin.username },
      });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default adminController;
