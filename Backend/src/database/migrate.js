const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");

async function migrate() {
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, "../../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Execute schema
      await client.query(schema);

      // Create admin user if not exists
      const adminExists = await client.query(
        "SELECT * FROM users WHERE email = $1",
        ["admin@example.com"]
      );

      if (adminExists.rows.length === 0) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await client.query(
          `INSERT INTO users (
            first_name, last_name, email, id_number, password,
            date_of_birth, phone_number, role, is_verified
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            "Admin",
            "User",
            "admin@example.com",
            "ADMIN001",
            hashedPassword,
            "2000-01-01",
            "1234567890",
            "admin",
            true,
          ]
        );
      }

      await client.query("COMMIT");
      console.log("Database migration completed successfully");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
migrate();
