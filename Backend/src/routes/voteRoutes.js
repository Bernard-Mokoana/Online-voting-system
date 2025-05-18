import express from "express";
import { castVote, getVoteResults } from "../controllers/voteController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/votes - Cast a vote
router.post("/", authenticateToken, castVote);

// GET /api/votes/results/:election_id - Get election results
router.get("/results/:election_id", getVoteResults);

// Add other vote-related routes as needed

export default router;
