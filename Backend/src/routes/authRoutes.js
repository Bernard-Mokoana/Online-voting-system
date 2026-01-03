import express from "express";
import {
  loginUser,
  logoutUser,
  refreshToken,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.post("/refresh", refreshToken);
authRouter.post("/reset", resetPassword);
authRouter.post("/verify", verifyEmail);
authRouter.get("/verify", verifyEmail);

export default authRouter;
