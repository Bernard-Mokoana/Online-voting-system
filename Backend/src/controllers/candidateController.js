import pool from "../config/db.js"; // Assuming you're using a database connection pool

// Get all candidates
export const getCandidates = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM candidate");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a candidate by ID
export const getCandidateById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM candidate WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
