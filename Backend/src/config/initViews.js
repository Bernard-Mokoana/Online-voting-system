import pool from "./db.js";

/**
 * Ensures the required database views exist in PostgreSQL.
 * If they do not exist, they are created automatically on server startup.
 */
export const ensureDatabaseViews = async () => {
  try {
    // 1. View: ActiveElections
    await pool.query(`
      CREATE OR REPLACE VIEW ActiveElections AS
      SELECT 
          e.ElectionID,
          e.ElectionName,
          COALESCE(et.TypeName, 'General') AS ElectionType,
          e.StartDate,
          e.EndDate,
          e.Description,
          e.IsActive,
          COALESCE(a.Username, 'admin') AS AdminUsername,
          COUNT(DISTINCT c.CandidateID) AS CandidateCount,
          COUNT(DISTINCT v.VoteID) AS VoteCount
      FROM Election e
      LEFT JOIN ElectionType et ON e.ElectionTypeID = et.ElectionTypeID
      LEFT JOIN Admin a ON e.AdminID = a.AdminID
      LEFT JOIN Candidate c ON e.ElectionID = c.ElectionID
      LEFT JOIN Vote v ON e.ElectionID = v.ElectionID
      WHERE e.IsActive = TRUE
          AND (
            (e.StartDate IS NULL OR e.StartDate <= CURRENT_TIMESTAMP)
            AND (e.EndDate IS NULL OR e.EndDate >= CURRENT_TIMESTAMP)
          )
      GROUP BY e.ElectionID, e.ElectionName, et.TypeName, e.StartDate, e.EndDate, e.Description, e.IsActive, a.Username;
    `);

    // 2. View: ElectionResults
    await pool.query(`
      CREATE OR REPLACE VIEW ElectionResults AS
      SELECT 
          e.ElectionID,
          e.ElectionName,
          c.CandidateID,
          c.FirstName || ' ' || c.LastName AS CandidateName,
          c.Position,
          COUNT(v.VoteID) AS VoteCount,
          ROUND(
              (COUNT(v.VoteID)::DECIMAL / NULLIF(
                  (SELECT COUNT(*) FROM Vote WHERE ElectionID = e.ElectionID), 0
              )) * 100, 2
          ) AS VotePercentage
      FROM Election e
      JOIN Candidate c ON e.ElectionID = c.ElectionID
      LEFT JOIN Vote v ON c.CandidateID = v.CandidateID
      GROUP BY e.ElectionID, e.ElectionName, c.CandidateID, c.FirstName, c.LastName, c.Position
      ORDER BY e.ElectionID, VoteCount DESC;
    `);

    // 3. View: VoterStatistics
    await pool.query(`
      CREATE OR REPLACE VIEW VoterStatistics AS
      SELECT 
          COUNT(*) AS TotalVoters,
          COUNT(CASE WHEN IsVerified = TRUE THEN 1 END) AS VerifiedVoters,
          COUNT(CASE WHEN HasVoted = TRUE THEN 1 END) AS VotersWhoVoted,
          COUNT(CASE WHEN IsVerified = TRUE AND HasVoted = FALSE THEN 1 END) AS VerifiedNotVoted,
          ROUND(
              (COUNT(CASE WHEN HasVoted = TRUE THEN 1 END)::DECIMAL / 
               NULLIF(COUNT(CASE WHEN IsVerified = TRUE THEN 1 END), 0)) * 100, 2
          ) AS VoterTurnoutPercentage
      FROM Voter;
    `);

    console.log("Database views verified / created successfully");
  } catch (error) {
    console.warn("Notice: Could not automatically create/verify database views:", error.message);
    console.warn("Fallback queries will be used automatically by controllers.");
  }
};
