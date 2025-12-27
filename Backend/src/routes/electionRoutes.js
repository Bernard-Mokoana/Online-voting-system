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
electionRouter.get("/:id", getElectionById);
electionRouter.put("/:id", updateElection);
electionRouter.delete("/:id", deleteElection);
electionRouter.get("/", getActiveElections);
electionRouter.get("/", getElectionResults);

export default electionRouter;
