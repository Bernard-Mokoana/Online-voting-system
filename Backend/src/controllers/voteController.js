import pool from "../config/database.js";

const voteController = {
  // Cast a vote
  castVote: async (req, res) => {
    try {
      const { electionId, candidateId } = req.body;
      const userId = req.user.id;

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Check if election is active
        const electionResult = await client.query(
          "SELECT * FROM elections WHERE id = $1 AND status = $2",
          [electionId, "active"]
        );

        if (electionResult.rows.length === 0) {
          return res.status(400).json({ message: "Election is not active" });
        }

        // Check if user has already voted in this election
        const existingVote = await client.query(
          "SELECT * FROM votes WHERE user_id = $1 AND election_id = $2",
          [userId, electionId]
        );

        if (existingVote.rows.length > 0) {
          return res
            .status(400)
            .json({ message: "You have already voted in this election" });
        }

        // Check if candidate exists and belongs to the election
        const candidateResult = await client.query(
          "SELECT * FROM candidates WHERE id = $1 AND election_id = $2",
          [candidateId, electionId]
        );

        if (candidateResult.rows.length === 0) {
          return res
            .status(400)
            .json({ message: "Invalid candidate for this election" });
        }

        // Record the vote
        await client.query(
          "INSERT INTO votes (user_id, candidate_id, election_id) VALUES ($1, $2, $3)",
          [userId, candidateId, electionId]
        );

        // Update candidate vote count
        await client.query(
          "UPDATE candidates SET votes = votes + 1 WHERE id = $1",
          [candidateId]
        );

        await client.query("COMMIT");

        // Log vote
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, details, ip_address)
           VALUES ($1, $2, $3, $4)`,
          [userId, "vote_cast", { electionId, candidateId }, req.ip]
        );

        res.json({ message: "Vote recorded successfully" });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Vote casting error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get election results
  getElectionResults: async (req, res) => {
    try {
      const { electionId } = req.params;

      // Get election details
      const electionResult = await pool.query(
        "SELECT * FROM elections WHERE id = $1",
        [electionId]
      );

      if (electionResult.rows.length === 0) {
        return res.status(404).json({ message: "Election not found" });
      }

      // Get candidates with vote counts
      const candidatesResult = await pool.query(
        `SELECT 
           c.*,
           COUNT(v.id) as vote_count,
           ROUND(COUNT(v.id)::numeric / NULLIF((SELECT COUNT(*) FROM votes WHERE election_id = $1), 0) * 100, 2) as vote_percentage
         FROM candidates c
         LEFT JOIN votes v ON c.id = v.candidate_id
         WHERE c.election_id = $1
         GROUP BY c.id
         ORDER BY vote_count DESC`,
        [electionId]
      );

      // Get total votes
      const totalVotesResult = await pool.query(
        "SELECT COUNT(*) as total_votes FROM votes WHERE election_id = $1",
        [electionId]
      );

      res.json({
        election: electionResult.rows[0],
        candidates: candidatesResult.rows,
        totalVotes: parseInt(totalVotesResult.rows[0].total_votes),
      });
    } catch (error) {
      console.error("Results fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get user's voting history
  getVotingHistory: async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `SELECT 
           v.created_at,
           e.title as election_title,
           c.first_name as candidate_first_name,
           c.last_name as candidate_last_name,
           c.party as candidate_party
         FROM votes v
         JOIN elections e ON v.election_id = e.id
         JOIN candidates c ON v.candidate_id = c.id
         WHERE v.user_id = $1
         ORDER BY v.created_at DESC`,
        [userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Voting history fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Verify if user has voted in an election
  verifyVote: async (req, res) => {
    try {
      const { electionId } = req.params;
      const userId = req.user.id;

      const result = await pool.query(
        "SELECT * FROM votes WHERE user_id = $1 AND election_id = $2",
        [userId, electionId]
      );

      res.json({ hasVoted: result.rows.length > 0 });
    } catch (error) {
      console.error("Vote verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get voting statistics
  getVotingStats: async (req, res) => {
    try {
      const { electionId } = req.params;

      const stats = await pool.query(
        `SELECT 
           COUNT(DISTINCT v.user_id) as total_voters,
           (SELECT COUNT(*) FROM users WHERE role = 'voter') as eligible_voters,
           COUNT(DISTINCT c.id) as total_candidates,
           COUNT(v.id) as total_votes,
           ROUND(COUNT(DISTINCT v.user_id)::numeric / NULLIF((SELECT COUNT(*) FROM users WHERE role = 'voter'), 0) * 100, 2) as voter_turnout
         FROM elections e
         LEFT JOIN candidates c ON e.id = c.election_id
         LEFT JOIN votes v ON e.id = v.election_id
         WHERE e.id = $1
         GROUP BY e.id`,
        [electionId]
      );

      if (stats.rows.length === 0) {
        return res.status(404).json({ message: "Election not found" });
      }

      res.json(stats.rows[0]);
    } catch (error) {
      console.error("Voting stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default voteController;
