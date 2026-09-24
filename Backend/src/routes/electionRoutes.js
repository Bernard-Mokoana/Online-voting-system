import express from "express";
import {
  createElection,
  getActiveElections,
  getAllElections,
  getElectionById,
  getElectionResults,
  deleteElection,
  updateElection,
} from "../controllers/electionController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const electionRouter = express.Router();

// Public read routes
electionRouter.get("/", getAllElections);
electionRouter.get("/active", getActiveElections);
electionRouter.get("/:id/results", getElectionResults);
electionRouter.get("/:id", getElectionById);

// FIX #19: Write routes now require admin authentication
electionRouter.post("/", authenticateToken, authorizeRole(["admin"]), createElection);
electionRouter.put("/:id", authenticateToken, authorizeRole(["admin"]), updateElection);
electionRouter.delete("/:id", authenticateToken, authorizeRole(["admin"]), deleteElection);

export default electionRouter;
