import express from "express";
import {
  getCandidates,
  getCandidateById,
} from "../controllers/candidateController.js";

const router = express.Router();

// Route to get all candidates
router.get("/", getCandidates);

// Route to get a specific candidate by ID
router.get("/:id", getCandidateById);

export default router;
