import express from "express";
import {
  castVote,
  getVoteResults,
  getVotingHistory,
} from "../controllers/voteController.js";
import { authenticateToken } from "../middlewares/auth.js";

const voteRouter = express.Router();

voteRouter.post("/", authenticateToken, castVote);
voteRouter.get("/history", authenticateToken, getVotingHistory);
voteRouter.get("/results/:electionId", getVoteResults);

export default voteRouter;
