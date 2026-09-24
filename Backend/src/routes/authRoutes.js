import express from "express";
import {
  loginUser,
  logoutUser,
  refreshToken,
  resetPassword,
  forgotPassword,
  verifyEmail,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.post("/refresh", refreshToken);
authRouter.post("/forgot-password", forgotPassword);  // FIX #2: new forgot-password endpoint
authRouter.post("/reset-password", resetPassword);    // FIX #2: renamed from /reset for clarity
authRouter.post("/verify", verifyEmail);
authRouter.get("/verify", verifyEmail);

export default authRouter;
