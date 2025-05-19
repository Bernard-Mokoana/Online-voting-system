import express from "express";
import electionController from "../controllers/electionController.js";

const router = express.Router();

// Route to get all elections
router.get("/", electionController.getAllElections);

// Route to get a specific election by ID
router.get("/:id", electionController.getElectionById);

// Route to create a new election
router.post("/", electionController.createElection);

// Route to update an election
router.put("/:id", electionController.updateElection);

// Route to delete an election
router.delete("/:id", electionController.deleteElection);

export default router;
