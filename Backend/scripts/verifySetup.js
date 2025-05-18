import bcrypt from "bcrypt";
import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const verifySetup = async () => {
  try {
    // Check if tables exist
    console.log("Checking database tables...");
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(
      "Existing tables:",
      tables.rows.map((t) => t.table_name)
    );

    // Check users
    console.log("\nChecking users...");
    const users = await pool.query("SELECT * FROM users");
    console.log("Total users:", users.rows.length);

    // Verify each user's password
    for (const user of users.rows) {
      const isValid = await bcrypt.compare("password123", user.password);
      console.log(`User: ${user.username}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Password valid: ${isValid}`);
      console.log("---");
    }

    // Check candidates
    console.log("\nChecking candidates...");
    const candidates = await pool.query("SELECT * FROM candidates");
    console.log("Total candidates:", candidates.rows.length);
    console.log(
      "Candidates:",
      candidates.rows.map((c) => c.name)
    );
  } catch (error) {
    console.error("Error verifying setup:", error);
  } finally {
    await pool.end();
  }
};

verifySetup();
