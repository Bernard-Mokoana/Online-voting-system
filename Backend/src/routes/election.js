const express = require("express");
const router = express.Router();
const electionController = require("../controllers/electionController");
const {
  authenticateToken,
  authorizeRole,
  verifyEmail,
} = require("../middlewares/auth");

// Public routes
router.get("/", electionController.getAllElections);
router.get("/:id", electionController.getElectionById);
router.get("/:id/stats", electionController.getElectionStats);

// Protected routes
router.post(
  "/",
  authenticateToken,
  authorizeRole(["admin"]),
  electionController.createElection
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  electionController.updateElection
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  electionController.deleteElection
);

module.exports = router;
