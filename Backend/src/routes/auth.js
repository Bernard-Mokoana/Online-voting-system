const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter, registerLimiter } = require("../middlewares/auth");

// Public routes
router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
