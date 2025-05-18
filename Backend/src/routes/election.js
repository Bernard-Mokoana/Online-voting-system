import express from "express";
import electionController from "../controllers/electionController.js";
import {
  authenticateToken,
  authorizeRole,
  verifyEmail,
} from "../middlewares/auth.js";

const router = express.Router();
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

export default router;
