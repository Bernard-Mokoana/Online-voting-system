import express from "express";
import userController from "../controllers/userController.js";
import {
  authenticateToken,
  authorizeRole,
  verifyEmail,
} from "../middlewares/auth.js";

const router = express.Router();

// Protected routes
router.get("/profile", authenticateToken, userController.getProfile);
router.put(
  "/profile",
  authenticateToken,
  verifyEmail,
  userController.updateProfile
);
router.delete("/account", authenticateToken, userController.deleteAccount);
router.get(
  "/voting-history",
  authenticateToken,
  userController.getVotingHistory
);

// Admin routes
router.get(
  "/all",
  authenticateToken,
  authorizeRole(["admin"]),
  userController.getAllUsers
);
router.put(
  "/:userId/role",
  authenticateToken,
  authorizeRole(["admin"]),
  userController.updateUserRole
);

export default router;
