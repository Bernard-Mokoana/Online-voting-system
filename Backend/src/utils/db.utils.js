import pool from "../config/db.js";

export const withTransaction = async (fn) => {
  const client = await pool.connect();
  let transactionStarted = false;
  try {
    await client.query("BEGIN");
    transactionStarted = true;
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Transaction rollback error:", rollbackError);
      }
    }
    throw error;
  } finally {
    client.release();
  }
};
