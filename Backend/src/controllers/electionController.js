import pool from "../config/db.js";

export const createElection = async (req, res) => {
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

    if (!ElectionName || !Description || !StartDate || !EndDate) {
      return res.status(400).json({ message: "All the fields are required" });
    }

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

    return res.status(201).json({
      message: "Election created successfully",
      election: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating election:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllElections = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Election ORDER BY Timestamp DESC"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Elections not found" });
    }

    return res
      .status(200)
      .json({ message: "All elections fetched successfully" }, result.rows);
  } catch (error) {
    console.error("Error fetching elections:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getActiveElections = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ActiveElections");

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Elections not found" });
    }

    return res
      .status(200)
      .json({ message: "Active elections fetched successfully" }, result.rows);
  } catch (error) {
    console.error("Error fetching active elections:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getElectionById = async (req, res) => {
  try {
    const { ElectionID } = req.params;
    const result = await pool.query(
      "SELECT * FROM Election WHERE ElectionID = $1",
      [ElectionID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    return res
      .status(200)
      .json({ message: "Election fetched successfully" }, result.rows[0]);
  } catch (error) {
    console.error("Error fetching election:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const updateElection = async (req, res) => {
  try {
    const { ElectionID } = req.params;
    const {
      ElectionName,
      Description,
      StartDate,
      EndDate,
      IsActive,
      ElectionTypeID,
      AdminID,
    } = req.body;

    if (!ElectionName || !Description || !StartDate || !EndDate) {
      return res.status(400).json({ message: "All the fields are required" });
    }

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
        ElectionID,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    return res.status(201).json({
      message: "Election updated successfully",
      election: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating election:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteElection = async (req, res) => {
  try {
    const { ElectionID } = req.params;

    const result = await pool.query(
      "DELETE FROM Election WHERE ElectionID = $1 RETURNING *",
      [ElectionID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    return res.json({
      message: "Election deleted successfully",
      election: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting election:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getElectionResults = async (req, res) => {
  try {
    const { ElectionID } = req.params;
    const result = await pool.query(
      "SELECT * FROM ElectionResults WHERE ElectionID = $1",
      [ElectionID]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this election" });
    }

    return res
      .status(200)
      .json({ message: "Results fetched successfully" }, result.rows);
  } catch (error) {
    console.error("Error fetching election results:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
