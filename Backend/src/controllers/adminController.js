import pool from "../config/db.js";

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
        activeElections: activeElections.rows[0],
        totalCandidates: parseInt(totalCandidates.rows.count),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
