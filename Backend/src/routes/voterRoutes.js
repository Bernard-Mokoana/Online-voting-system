import express from "express";
import {
  registerUser,
  getVoterById,
  updateVoter,
  deleteAccount,
} from "../controllers/voterController.js";
import { verifyEmail } from "../controllers/authController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.middleware.js";

const voterRoutes = express.Router();

voterRoutes.post("/register", upload.single("avatar"), registerUser);
voterRoutes.post("/verify-email", verifyEmail);

voterRoutes.get("/profile/:voterId", authenticateToken, getVoterById);
voterRoutes.put("/profile", authenticateToken, updateVoter);
voterRoutes.delete("/account", authenticateToken, deleteAccount);

// voterRouter.get(
//   "/voting-history",
//   authenticateToken,
//   userController.getVotingHistory
// );

export default voterRoutes;
