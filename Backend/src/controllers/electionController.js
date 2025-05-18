const { pool } = require("../config/database");

const electionController = {
  // Create new election
  createElection: async (req, res) => {
    try {
      const { title, description, startDate, endDate, candidates } = req.body;

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Create election
        const electionResult = await client.query(
          `INSERT INTO elections (title, description, start_date, end_date)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [title, description, startDate, endDate]
        );

        const electionId = electionResult.rows[0].id;

        // Add candidates
        for (const candidate of candidates) {
          await client.query(
            `INSERT INTO candidates (
              first_name, last_name, email, id_number,
              party, position, election_id, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              candidate.firstName,
              candidate.lastName,
              candidate.email,
              candidate.idNumber,
              candidate.party,
              candidate.position,
              electionId,
              candidate.imageUrl,
            ]
          );
        }

        await client.query("COMMIT");

        // Log election creation
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, details, ip_address)
           VALUES ($1, $2, $3, $4)`,
          [req.user.id, "election_create", { electionId, title }, req.ip]
        );

        res
          .status(201)
          .json({ message: "Election created successfully", electionId });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Election creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get all elections
  getAllElections: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT e.*, 
               COUNT(DISTINCT c.id) as candidate_count,
               COUNT(DISTINCT v.id) as vote_count
        FROM elections e
        LEFT JOIN candidates c ON e.id = c.election_id
        LEFT JOIN votes v ON e.id = v.election_id
      `;

      const queryParams = [];

      if (status) {
        queryParams.push(status);
        query += ` WHERE e.status = $${queryParams.length}`;
      }

      query += ` GROUP BY e.id ORDER BY e.created_at DESC LIMIT $${
        queryParams.length + 1
      } OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);

      const result = await pool.query(query, queryParams);

      // Get total count for pagination
      const countQuery = query
        .replace(/SELECT.*FROM/, "SELECT COUNT(DISTINCT e.id) FROM")
        .split("GROUP BY")[0];
      const countResult = await pool.query(
        countQuery,
        queryParams.slice(0, -2)
      );

      res.json({
        elections: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      });
    } catch (error) {
      console.error("Elections fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get election by ID
  getElectionById: async (req, res) => {
    try {
      const { id } = req.params;

      // Get election details
      const electionResult = await pool.query(
        `SELECT e.*, 
                COUNT(DISTINCT c.id) as candidate_count,
                COUNT(DISTINCT v.id) as vote_count
         FROM elections e
         LEFT JOIN candidates c ON e.id = c.election_id
         LEFT JOIN votes v ON e.id = v.election_id
         WHERE e.id = $1
         GROUP BY e.id`,
        [id]
      );

      if (electionResult.rows.length === 0) {
        return res.status(404).json({ message: "Election not found" });
      }

      // Get candidates
      const candidatesResult = await pool.query(
        `SELECT c.*, COUNT(v.id) as vote_count
         FROM candidates c
         LEFT JOIN votes v ON c.id = v.candidate_id
         WHERE c.election_id = $1
         GROUP BY c.id
         ORDER BY vote_count DESC`,
        [id]
      );

      res.json({
        ...electionResult.rows[0],
        candidates: candidatesResult.rows,
      });
    } catch (error) {
      console.error("Election fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Update election
  updateElection: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, startDate, endDate, status } = req.body;

      await pool.query(
        `UPDATE elections 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             start_date = COALESCE($3, start_date),
             end_date = COALESCE($4, end_date),
             status = COALESCE($5, status)
         WHERE id = $6`,
        [title, description, startDate, endDate, status, id]
      );

      // Log election update
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, details, ip_address)
         VALUES ($1, $2, $3, $4)`,
        [
          req.user.id,
          "election_update",
          { electionId: id, updates: req.body },
          req.ip,
        ]
      );

      res.json({ message: "Election updated successfully" });
    } catch (error) {
      console.error("Election update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Delete election
  deleteElection: async (req, res) => {
    try {
      const { id } = req.params;

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Delete votes
        await client.query("DELETE FROM votes WHERE election_id = $1", [id]);

        // Delete candidates
        await client.query("DELETE FROM candidates WHERE election_id = $1", [
          id,
        ]);

        // Delete election
        await client.query("DELETE FROM elections WHERE id = $1", [id]);

        await client.query("COMMIT");

        // Log election deletion
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, details, ip_address)
           VALUES ($1, $2, $3, $4)`,
          [req.user.id, "election_delete", { electionId: id }, req.ip]
        );

        res.json({ message: "Election deleted successfully" });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Election deletion error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get election statistics
  getElectionStats: async (req, res) => {
    try {
      const { id } = req.params;

      const stats = await pool.query(
        `SELECT 
           COUNT(DISTINCT v.user_id) as total_voters,
           COUNT(DISTINCT c.id) as total_candidates,
           COUNT(v.id) as total_votes,
           (SELECT COUNT(*) FROM users WHERE role = 'voter') as eligible_voters
         FROM elections e
         LEFT JOIN candidates c ON e.id = c.election_id
         LEFT JOIN votes v ON e.id = v.election_id
         WHERE e.id = $1
         GROUP BY e.id`,
        [id]
      );

      if (stats.rows.length === 0) {
        return res.status(404).json({ message: "Election not found" });
      }

      res.json(stats.rows[0]);
    } catch (error) {
      console.error("Election stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = electionController;
