// import express from "express";
// import { registerUser, loginUser } from "../controllers/authController.js";

// const router = express.Router();

// // POST /api/auth/register
// router.post("/register", registerUser);

// // POST /api/auth/login
// router.post("/login", loginUser);

// export default router;

// import express from "express";
// import { registerUser, loginUser } from "../controllers/authController.js";

// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);

// export default router;

// import express from "express";
// import pool from "../config/db.js";

// const router = express.Router();

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // 1. Use consistent column naming (no quotes or consistent quotes)
//     const query = "SELECT * FROM voter WHERE email = $1";
//     const result = await pool.query(query, [email]);

//     if (result.rows.length === 0) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const user = result.rows[0];
//     console.log("Full user record:", user); // Debug log

//     // 2. Access password with correct case (likely lowercase)
//     const dbPassword = user.password;
//     console.log("Password from DB:", dbPassword);

//     // 3. Compare passwords
//     if (dbPassword !== password) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // 4. Login successful - exclude password from response
//     const { password: _, ...userData } = user;
//     res.json({
//       message: "Login successful",
//       user: userData,
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;

import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Determine table based on role
    const table = role === "admin" ? "admin" : "voter";
    const query = `SELECT * FROM ${table} WHERE email = $1`;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Plain text comparison (for development only)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Remove password before sending response
    const { password: _, ...userData } = user;

    res.json({
      success: true,
      user: {
        ...userData,
        role, // Add role to user object
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
