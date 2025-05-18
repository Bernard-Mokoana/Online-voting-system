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

const seedData = async () => {
  try {
    // Clear existing data
    await pool.query("DELETE FROM votes");
    await pool.query("DELETE FROM candidates");
    await pool.query("DELETE FROM users");

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Insert admin users
    const adminUsers = [
      { username: "admin1", password: hashedPassword, role: "admin" },
      { username: "admin2", password: hashedPassword, role: "admin" },
    ];

    // Insert voter users
    const voterUsers = [
      { username: "voter1", password: hashedPassword, role: "voter" },
      { username: "voter2", password: hashedPassword, role: "voter" },
      { username: "voter3", password: hashedPassword, role: "voter" },
    ];

    // Insert all users
    for (const user of [...adminUsers, ...voterUsers]) {
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        [user.username, user.password, user.role]
      );
      console.log(`Created ${user.role} user: ${user.username}`);
    }

    // Insert initial candidates with images
    const candidates = [
      {
        name: "John Doe",
        image_url: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      {
        name: "Jane Smith",
        image_url: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      {
        name: "Bob Johnson",
        image_url: "https://randomuser.me/api/portraits/men/2.jpg",
      },
    ];

    for (const candidate of candidates) {
      await pool.query(
        "INSERT INTO candidates (name, image_url) VALUES ($1, $2)",
        [candidate.name, candidate.image_url]
      );
      console.log(`Created candidate: ${candidate.name}`);
    }

    console.log("\nTest data created successfully!");
    console.log("\nYou can use these credentials to test:");
    console.log("\nAdmin users:");
    console.log("Username: admin1, Password: password123");
    console.log("Username: admin2, Password: password123");
    console.log("\nVoter users:");
    console.log("Username: voter1, Password: password123");
    console.log("Username: voter2, Password: password123");
    console.log("Username: voter3, Password: password123");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await pool.end();
  }
};

seedData();
