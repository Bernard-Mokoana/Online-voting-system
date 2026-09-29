import pool from "../config/db.js";
import { mapVoterRow } from "../utils/mappers.js";

export const getDashboardStats = async (req, res) => {
  try {
    let voterStats = { rows: [] };
    try {
      voterStats = await pool.query(`SELECT * FROM VoterStatistics`);
    } catch (e) {
      // Fallback: Compute directly from Voter table
      voterStats = await pool.query(`
        SELECT 
          COUNT(*)::int AS totalvoters,
          COUNT(CASE WHEN IsVerified = TRUE THEN 1 END)::int AS verifiedvoters,
          COUNT(CASE WHEN HasVoted = TRUE THEN 1 END)::int AS voterswhovoted,
          COUNT(CASE WHEN IsVerified = TRUE AND HasVoted = FALSE THEN 1 END)::int AS verifiednotvoted,
          ROUND(
            (COUNT(CASE WHEN HasVoted = TRUE THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(CASE WHEN IsVerified = TRUE THEN 1 END), 0)) * 100, 2
          ) AS voterturnoutpercentage
        FROM Voter
      `);
    }

    let activeElections = { rows: [] };
    try {
      activeElections = await pool.query(`SELECT * FROM ActiveElections`);
    } catch (e) {
      // Fallback: Compute directly from Election table
      activeElections = await pool.query(`
        SELECT 
          e.ElectionID,
          e.ElectionName,
          COALESCE(et.TypeName, 'General') AS ElectionType,
          e.StartDate,
          e.EndDate,
          e.Description,
          e.IsActive,
          COUNT(DISTINCT c.CandidateID)::int AS CandidateCount,
          COUNT(DISTINCT v.VoteID)::int AS VoteCount
        FROM Election e
        LEFT JOIN ElectionType et ON e.ElectionTypeID = et.ElectionTypeID
        LEFT JOIN Candidate c ON e.ElectionID = c.ElectionID
        LEFT JOIN Vote v ON e.ElectionID = v.ElectionID
        WHERE e.IsActive = TRUE
        GROUP BY e.ElectionID, e.ElectionName, et.TypeName, e.StartDate, e.EndDate, e.Description, e.IsActive
        ORDER BY e.StartDate DESC
      `);
    }

    const totalCandidates = await pool.query(`SELECT COUNT(*)::int FROM Candidate`);

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        voterOverview: voterStats.rows[0] || {
          totalvoters: 0,
          verifiedvoters: 0,
          voterswhovoted: 0,
          verifiednotvoted: 0,
          voterturnoutpercentage: "0.00",
        },
        activeElections: activeElections.rows,
        totalCandidates: Number(totalCandidates.rows[0]?.count ?? 0),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const votersResult = await pool.query(
      `SELECT "voterid", "firstname", "lastname", "email", "isverified", "hasvoted", "createdat"
       FROM voter
       ORDER BY "createdat" DESC`
    );

    const users = votersResult.rows.map((row) => ({
      ...mapVoterRow(row),
      id: row.voterid,
      role: "voter",
    }));

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
