const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");
const {
  authenticateToken,
  verifyEmail,
  voteLimiter,
} = require("../middlewares/auth");

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

module.exports = router;
