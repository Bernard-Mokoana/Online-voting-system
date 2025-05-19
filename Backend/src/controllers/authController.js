// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import pool from "../database/database.js";

// export const registerUser = async (req, res) => {
//   try {
//     const { email, password, first_name, last_name } = req.body;

//     // Validate input
//     if (!email || !password || !first_name || !last_name) {
//       return res.status(400).json({
//         success: false,
//         error: "All fields are required",
//       });
//     }

//     // Check if user exists using voter table (from your schema)
//     const userExists = await pool.query(
//       "SELECT voterid FROM voter WHERE email = $1",
//       [email]
//     );

//     if (userExists.rows.length > 0) {
//       return res.status(409).json({
//         success: false,
//         error: "User already exists",
//       });
//     }

//     // Hash password with stronger salt rounds
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Create user in voter table (matching your schema)
//     const newUser = await pool.query(
//       `INSERT INTO voter
//        (email, passwordhash, firstname, lastname, isactive)
//        VALUES ($1, $2, $3, $4, $5)
//        RETURNING voterid as id, email, firstname as first_name, lastname as last_name`,
//       [email, hashedPassword, first_name, last_name, true]
//     );

//     // Generate token with more secure options
//     const token = jwt.sign(
//       {
//         id: newUser.rows[0].id,
//         role: "voter", // Added role to token payload
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1h",
//         algorithm: "HS256",
//       }
//     );

//     // Log the registration in voter audit log
//     await pool.query(
//       `INSERT INTO voterauditlog
//        (voterid, actiontypeid, description)
//        VALUES ($1, $2, $3)`,
//       [newUser.rows[0].id, 2, "User registration"] // Assuming 2 is registration action
//     );

//     res.status(201).json({
//       success: true,
//       token,
//       user: newUser.rows[0],
//     });
//   } catch (err) {
//     console.error("Registration error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Registration failed",
//     });
//   }
// };

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         error: "Email and password are required",
//       });
//     }

//     // Find user in voter table
//     const user = await pool.query(
//       `SELECT v.*, a.addressline1, a.city, a.state, a.zipcode
//        FROM voter v
//        LEFT JOIN address a ON v.addressid = a.addressid
//        WHERE v.email = $1`,
//       [email]
//     );

//     if (user.rows.length === 0) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid credentials",
//       });
//     }

//     // Check password
//     const validPassword = await bcrypt.compare(
//       password,
//       user.rows[0].passwordhash
//     );

//     if (!validPassword) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid credentials",
//       });
//     }

//     // Check if account is active
//     if (!user.rows[0].isactive) {
//       return res.status(403).json({
//         success: false,
//         error: "Account is inactive",
//       });
//     }

//     // Generate token with role
//     const token = jwt.sign(
//       {
//         id: user.rows[0].voterid,
//         role: "voter",
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1h",
//         algorithm: "HS256",
//       }
//     );

//     // Log the login in voter audit log
//     await pool.query(
//       `INSERT INTO voterauditlog
//        (voterid, actiontypeid, description)
//        VALUES ($1, $2, $3)`,
//       [user.rows[0].voterid, 1, "User login"] // Assuming 1 is login action
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user.rows[0].voterid,
//         email: user.rows[0].email,
//         first_name: user.rows[0].firstname,
//         last_name: user.rows[0].lastname,
//         address: {
//           line1: user.rows[0].addressline1,
//           city: user.rows[0].city,
//           state: user.rows[0].state,
//           zipcode: user.rows[0].zipcode,
//         },
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Login failed",
//     });
//   }
// };

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../database/database.js";

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
      user.rows[0].passwordhash
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
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role)
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });

    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [
      email,
    ]);
    if (existing.rows.length > 0)
      return res
        .status(409)
        .json({ success: false, error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await pool.query(
      `INSERT INTO users (email, passwordhash, role) VALUES ($1, $2, $3) RETURNING id, email, role`,
      [email, hashedPassword, role]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      token,
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
};
