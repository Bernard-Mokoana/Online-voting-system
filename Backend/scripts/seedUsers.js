const bcrypt = require("bcrypt");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const seedUsers = async () => {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Admin users
    const adminUsers = [
      { username: "admin1", password: hashedPassword, role: "admin" },
      { username: "admin2", password: hashedPassword, role: "admin" },
    ];

    // Voter users
    const voterUsers = [
      { username: "voter1", password: hashedPassword, role: "voter" },
      { username: "voter2", password: hashedPassword, role: "voter" },
      { username: "voter3", password: hashedPassword, role: "voter" },
    ];

    // Insert admin users
    for (const user of adminUsers) {
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        [user.username, user.password, user.role]
      );
      console.log(`Created admin user: ${user.username}`);
    }

    // Insert voter users
    for (const user of voterUsers) {
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        [user.username, user.password, user.role]
      );
      console.log(`Created voter user: ${user.username}`);
    }

    console.log("\nTest users created successfully!");
    console.log("\nYou can use these credentials to test:");
    console.log("\nAdmin users:");
    console.log("Username: admin1, Password: password123");
    console.log("Username: admin2, Password: password123");
    console.log("\nVoter users:");
    console.log("Username: voter1, Password: password123");
    console.log("Username: voter2, Password: password123");
    console.log("Username: voter3, Password: password123");
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await pool.end();
  }
};

seedUsers();
