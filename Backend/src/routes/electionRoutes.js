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

const electionRouter = express.Router();

electionRouter.post("/", createElection);
electionRouter.get("/", getAllElections);
electionRouter.get("/active", getActiveElections);
electionRouter.get("/:id/results", getElectionResults);
electionRouter.get("/:id", getElectionById);
electionRouter.put("/:id", updateElection);
electionRouter.delete("/:id", deleteElection);

export default electionRouter;
