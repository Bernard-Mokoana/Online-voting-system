import express from "express";
import {
  registerUser,
  getVoterById,
  updateVoter,
  deleteAccount,
} from "../controllers/voterController.js";
import {
  authenticateToken,
  authorizeRole,
  verifyEmail,
} from "../middlewares/auth.js";

const voterRoutes = express.Router();

voterRoutes.post("/register", registerUser);

voterRoutes.get("/profile/:voterId", authenticateToken, getVoterById);
voterRoutes.put("/profile", updateVoter);
voterRoutes.delete("/account", authenticateToken, deleteAccount);

// voterRouter.get(
//   "/voting-history",
//   authenticateToken,
//   userController.getVotingHistory
// );

export default voterRoutes;
