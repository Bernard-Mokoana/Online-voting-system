import express from "express";
import {
  registerCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} from "../controllers/candidateController.js";

const candidateRouter = express.Router();

candidateRouter.post("/register", registerCandidate);
candidateRouter.get("/", getCandidates);
candidateRouter.get("/:id", getCandidateById);
candidateRouter.put("/", updateCandidate);
candidateRouter.delete("/", deleteCandidate);

export default candidateRouter;
