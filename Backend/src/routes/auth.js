import express from "express";
const router = express.Router();
import authController from "../controllers/authController.js";
import { loginLimiter, registerLimiter } from "../middlewares/auth.js";

// Public routes
router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/refresh-token", authController.refreshToken);

export default router;
