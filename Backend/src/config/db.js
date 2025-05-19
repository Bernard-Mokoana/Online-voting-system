// // src/config/db.js
// import pkg from "pg";
// const { Pool } = pkg;
// import dotenv from "dotenv";
// dotenv.config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl:
//     process.env.NODE_ENV === "production"
//       ? { rejectUnauthorized: false }
//       : false,
// });

// pool.on("connect", () => {
//   console.log("Connected to the PostgreSQL database");
// });

// pool.on("error", (err) => {
//   console.error("Unexpected error on idle client", err);
//   process.exit(-1);
// });

// export default pool;

// import pg from "pg";
// const { Pool } = pg;

// const pool = new Pool({
//   //   connectionString: process.env.DATABASE_URL,
//   user: "postgres",
//   password: "Bernard@200", // Unencoded password
//   host: "localhost",
//   port: 5432,
//   database: "Online voting system",
// });

// export default pool;

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add these if you have SSL issues:
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export default pool;
