import pool from "../config/db.js";

export const castVote = async (req, res) => {
  try {
    const { ElectionId, CandidateId } = req.body;
    const VoterId = req.user.id;

    const existingVote = await pool.query(
      `SELECT * FROM "vote" WHERE "voterid" = $1 AND "electionid" = $2`,
      [VoterId, ElectionId]
    );

    if (existingVote.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "You have already voted in this election",
      });
    }

    await pool.query(
      "INSERT INTO vote (VoterId, CandidateId, ElectionId) VALUES ($1, $2, $3)",
      [VoterId, CandidateId, ElectionId]
    );

    return res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
    });
  } catch (err) {
    console.error("Voting error: ", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to record vote" || err.message,
    });
  }
};

export const getVoteResults = async (req, res) => {
  try {
    const { ElectionId } = req.params;

    const results = await pool.query(
      `SELECT * FROM ElectionResults WHERE ElectionID = $1`[ElectionId]
    );

    if (results.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No results found for the election" });
    }

    return res.status(200).json({
      success: true,
      message: "Votes fetched successfully",
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
