const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticateToken,
  authorizeRole,
  verifyEmail,
} = require("../middlewares/auth");

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
