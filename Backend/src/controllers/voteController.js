import pool from "../config/db.js";

export const castVote = async (req, res) => {
  try {
    const { ElectionId, CandidateId } = req.body;
    const VoterId = req.user.id;

    const existingVote = await pool.query(
      "SELECT * FROM votes WHERE VoterId = $1 AND ElectionId = $2",
      [VoterId, ElectionId]
    );

    if (existingVote.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "You have already voted in this election",
      });
    }

    await pool.query(
      "INSERT INTO votes (VoterId, CandidateId, ElectionId) VALUES ($1, $2, $3)",
      [VoterId, CandidateId, ElectionId]
    );

    await pool.query(
      "UPDATE candidates SET votes = votes + 1 WHERE CandidateId = $1",
      [CandidateId]
    );

    return res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to record vote",
    });
  }
};

export const getVoteResults = async (req, res) => {
  try {
    const { ElectionId } = req.params;

    const results = await pool.query(
      `SELECT c.id, c.name, c.party, COUNT(v.id) as votes
       FROM candidates c
       LEFT JOIN votes v ON c.id = v.candidate_id
       WHERE c.election_id = $1
       GROUP BY c.id
       ORDER BY votes DESC`,
      [ElectionId]
    );

    return res.status(200).json({
      success: true,
      results: results.rows,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch results",
    });
  }
};
