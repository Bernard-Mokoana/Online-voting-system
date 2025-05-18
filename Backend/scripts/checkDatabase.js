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

const checkDatabase = async () => {
  try {
    // Check database connection
    console.log("Checking database connection...");
    await pool.query("SELECT NOW()");
    console.log("Database connection successful\n");

    // Check tables
    console.log("Checking tables...");
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(
      "Tables found:",
      tables.rows.map((t) => t.table_name),
      "\n"
    );

    // Check users
    console.log("Checking users...");
    const users = await pool.query("SELECT * FROM users");
    console.log("Users found:", users.rows.length);
    users.rows.forEach((user) => {
      console.log(`- ${user.username} (${user.role})`);
    });
    console.log();

    // Check candidates
    console.log("Checking candidates...");
    const candidates = await pool.query("SELECT * FROM candidates");
    console.log("Candidates found:", candidates.rows.length);
    candidates.rows.forEach((candidate) => {
      console.log(`- ${candidate.name} (${candidate.image_url})`);
    });
    console.log();

    // Check votes
    console.log("Checking votes...");
    const votes = await pool.query("SELECT * FROM votes");
    console.log("Votes found:", votes.rows.length);
    votes.rows.forEach((vote) => {
      console.log(
        `- User ${vote.user_id} voted for candidate ${vote.candidate_id}`
      );
    });
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await pool.end();
  }
};

checkDatabase();
