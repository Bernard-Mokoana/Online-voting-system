import pool from "../config/db.js";
import { mapVoterRow } from "../utils/mappers.js";

export const getDashboardStats = async (req, res) => {
  try {
    const voterStats = await pool.query(`SELECT * FROM VoterStatistics`);
    const activeElections = await pool.query(`SELECT * FROM ActiveElections`);
    const totalCandidates = await pool.query(`SELECT COUNT(*) FROM Candidate`);

    // if (voterStats.rows.length === 0) {
    //   return res.status(404).json({ message: "Voter stats not found" });
    // }

    // if (activeElections) {
    //   return res.status(404).json({ message: "Active elections not found" });
    // }

    // if (totalCandidates) {
    //   return res.status(404).json({ message: "Candidates not found" });
    // }

    if (
      voterStats.rows.length === 0 &&
      activeElections.rows.length === 0 &&
      totalCandidates.rows.length === 0
    ) {
      return res.status(404).json({ message: "Dashboard stats not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        voterOverview: voterStats.rows[0],
        activeElections: activeElections.rows,  // FIX #22: was .rows[0] — now returns all active elections
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
