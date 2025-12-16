import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });

    const user = await pool.query(`SELECT * FROM voter WHERE email = $1`, [
      email,
    ]);

    if (user.rows.length === 0)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].hashedPassword
    );
    if (!validPassword)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        role: user.rows[0].role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, error: "Login failed, Internal server error" });
  }
};
