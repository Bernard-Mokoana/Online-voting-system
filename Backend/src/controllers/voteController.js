import pool from "../config/db.js";
import { mapVoteResultRow, mapVotingHistoryRow } from "../utils/mappers.js";

export const castVote = async (req, res) => {
  try {
    const electionId = Number(req.body.electionId ?? req.body.ElectionId);
    const candidateId = Number(req.body.candidateId ?? req.body.CandidateId);
    const voterId = Number(req.user.id);

    if (!electionId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: "electionId and candidateId are required",
      });
    }

    const existingVote = await pool.query(
      `SELECT * FROM "vote" WHERE "voterid" = $1 AND "electionid" = $2`,
      [voterId, electionId]
    );

    if (existingVote.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already voted in this election",
      });
    }

    await pool.query(
      "INSERT INTO vote (VoterId, CandidateId, ElectionId) VALUES ($1, $2, $3)",
      [voterId, candidateId, electionId]
    );

    return res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
    });
  } catch (err) {
    console.error("Voting error: ", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to record vote",
    });
  }
};

export const getVoteResults = async (req, res) => {
  try {
    const electionId = Number(req.params.electionId ?? req.params.ElectionId);

    const results = await pool.query(
      `SELECT * FROM ElectionResults WHERE ElectionID = $1`,
      [electionId]
    );

    if (results.rows.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No results found for the election",
          data: [],
        });
    }

    return res.status(200).json({
      success: true,
      message: "Votes fetched successfully",
      data: results.rows.map(mapVoteResultRow),
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch results",
    });
  }
};

export const getVotingHistory = async (req, res) => {
  try {
    const voterId = Number(req.user.id);

    const result = await pool.query(
      `SELECT 
        v."voteid",
        v."votedat",
        e."electionid",
        e."electionname",
        c."candidateid",
        c."firstname",
        c."lastname"
      FROM "vote" v
      JOIN "election" e ON e."electionid" = v."electionid"
      JOIN "candidate" c ON c."candidateid" = v."candidateid"
      WHERE v."voterid" = $1
      ORDER BY v."votedat" DESC`,
      [voterId]
    );

    return res.status(200).json({
      success: true,
      message: "Voting history fetched successfully",
      data: result.rows.map(mapVotingHistoryRow),
    });
  } catch (error) {
    console.error("Failed to fetch voting history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch voting history",
    });
  }
};
