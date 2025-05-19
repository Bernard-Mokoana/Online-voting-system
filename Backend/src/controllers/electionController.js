import pool from "../config/db.js";

const electionController = {
  // Get all elections
  getAllElections: async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM Election ORDER BY Timestamp DESC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching elections:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get active elections (using the vw_active_elections view)
  getActiveElections: async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM vw_active_elections");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching active elections:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get election by ID
  getElectionById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "SELECT * FROM Election WHERE ElectionID = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Election not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching election:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Create a new election
  createElection: async (req, res) => {
    try {
      const {
        ElectionName,
        Description,
        StartDate,
        EndDate,
        IsActive,
        ElectionTypeID,
        AdminID,
      } = req.body;

      const result = await pool.query(
        `INSERT INTO Election (ElectionName, Description, StartDate, EndDate, IsActive, ElectionTypeID, AdminID) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          ElectionName,
          Description,
          StartDate,
          EndDate,
          IsActive,
          ElectionTypeID,
          AdminID,
        ]
      );

      res.status(201).json({
        message: "Election created successfully",
        election: result.rows[0],
      });
    } catch (error) {
      console.error("Error creating election:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Update an election
  updateElection: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        ElectionName,
        Description,
        StartDate,
        EndDate,
        IsActive,
        ElectionTypeID,
        AdminID,
      } = req.body;

      const result = await pool.query(
        `UPDATE Election 
         SET ElectionName = COALESCE($1, ElectionName),
             Description = COALESCE($2, Description),
             StartDate = COALESCE($3, StartDate),
             EndDate = COALESCE($4, EndDate),
             IsActive = COALESCE($5, IsActive),
             ElectionTypeID = COALESCE($6, ElectionTypeID),
             AdminID = COALESCE($7, AdminID)
         WHERE ElectionID = $8 RETURNING *`,
        [
          ElectionName,
          Description,
          StartDate,
          EndDate,
          IsActive,
          ElectionTypeID,
          AdminID,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Election not found" });
      }

      res.json({
        message: "Election updated successfully",
        election: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating election:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Delete an election
  deleteElection: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM Election WHERE ElectionID = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Election not found" });
      }

      res.json({
        message: "Election deleted successfully",
        election: result.rows[0],
      });
    } catch (error) {
      console.error("Error deleting election:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get election results (using the vw_election_results view)
  getElectionResults: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "SELECT * FROM vw_election_results WHERE ElectionID = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "No results found for this election" });
      }

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching election results:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default electionController;
