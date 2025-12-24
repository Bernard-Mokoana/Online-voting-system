import express from "express";
import {
  registerUser,
  getVoterById,
  updateVoter,
  deleteAccount,
} from "../controllers/voterController.js";
import { verifyEmail } from "../controllers/authController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const voterRoutes = express.Router();

voterRoutes.post("/register", registerUser);
voterRoutes.post("/verify-email", verifyEmail);

voterRoutes.get("/profile/:voterId", authenticateToken, getVoterById);
voterRoutes.put("/profile", updateVoter);
voterRoutes.delete("/account", authenticateToken, deleteAccount);

// voterRouter.get(
//   "/voting-history",
//   authenticateToken,
//   userController.getVotingHistory
// );

export default voterRoutes;
