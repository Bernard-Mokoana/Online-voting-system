// import app from "./app.js";
// import pool from "./config/db.js";
// import dotenv from "dotenv";

// dotenv.config();

// const PORT = process.env.PORT || 5000;
// const databaseUrl = process.env.DATABASE_URL;

// if (!databaseUrl) {
//   console.error(" DATABASE_URL is not set in .env file");
//   process.exit(1);
// }

// console.log("Attempting to connect to the database...");
// console.log("Database URL:", proccess.env.DATABASE_URL ? "exists" : "missing");

// pool
//   .connect()
//   .then((client) => {
//     console.log(" Database connected successfully");
//     app.listen(PORT, () => {
//       console.log(` Server is running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error(" Database connection failed:", err.message);
//     process.exit(1);
//   });

import app from "./app.js";
import pool from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Verify database connection before starting server
const startServer = async () => {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log("Database connected successfully");
    client.release();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
