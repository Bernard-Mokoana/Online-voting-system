import express from "express";
import { castVote, getVoteResults } from "../controllers/voteController.js";
import { authenticateToken } from "../middlewares/auth.js";

const voteRouter = express.Router();

voteRouter.post("/", authenticateToken, castVote);
voteRouter.get("/results/:ElectionId", getVoteResults);

export default voteRouter;
