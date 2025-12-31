import express from "express";
import {
  registerCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} from "../controllers/candidateController.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticateToken } from "../middlewares/auth.js";

const candidateRouter = express.Router();

candidateRouter.post("/register", upload.single("single"), registerCandidate);
candidateRouter.get("/", getCandidates);
candidateRouter.get("/:id", getCandidateById);

candidateRouter.put(
  "/",
  authenticateToken,
  upload.single("image"),
  updateCandidate
);
candidateRouter.delete("/", authenticateToken, deleteCandidate);

export default candidateRouter;
