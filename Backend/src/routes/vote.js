import express from "express";
const router = express.Router();
import voteController from "../controllers/voteController.js";
import {
  authenticateToken,
  verifyEmail,
  voteLimiter,
} from "../middlewares/auth.js";

// Protected routes
router.post(
  "/",
  authenticateToken,
  verifyEmail,
  voteLimiter,
  voteController.castVote
);
router.get("/results/:electionId", voteController.getElectionResults);
router.get("/history", authenticateToken, voteController.getVotingHistory);
router.get("/verify/:electionId", authenticateToken, voteController.verifyVote);
router.get("/stats/:electionId", voteController.getVotingStats);

export default router;
