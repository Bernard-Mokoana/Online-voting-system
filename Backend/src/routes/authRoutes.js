import express from "express";
import {
  loginUser,
  logoutUser,
  refreshToken,
  resetPassword,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.post("/refresh", refreshToken);
authRouter.post("/reset", resetPassword);

export default authRouter;
