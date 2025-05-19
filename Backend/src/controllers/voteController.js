import pool from "../database/database.js";

export const castVote = async (req, res) => {
  try {
    const { election_id, candidate_id } = req.body;
    const voter_id = req.user.id;

    // Check if voter has already voted in this election
    const existingVote = await pool.query(
      "SELECT * FROM votes WHERE voter_id = $1 AND election_id = $2",
      [voter_id, election_id]
    );

    if (existingVote.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "You have already voted in this election",
      });
    }

    // Record the vote
    await pool.query(
      "INSERT INTO votes (voter_id, candidate_id, election_id) VALUES ($1, $2, $3)",
      [voter_id, candidate_id, election_id]
    );

    // Update candidate's vote count
    await pool.query("UPDATE candidates SET votes = votes + 1 WHERE id = $1", [
      candidate_id,
    ]);

    res.json({
      success: true,
      message: "Vote recorded successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Failed to record vote",
    });
  }
};

export const getVoteResults = async (req, res) => {
  try {
    const { election_id } = req.params;

    const results = await pool.query(
      `SELECT c.id, c.name, c.party, COUNT(v.id) as votes
       FROM candidates c
       LEFT JOIN votes v ON c.id = v.candidate_id
       WHERE c.election_id = $1
       GROUP BY c.id
       ORDER BY votes DESC`,
      [election_id]
    );

    res.json({
      success: true,
      results: results.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch results",
    });
  }
};
