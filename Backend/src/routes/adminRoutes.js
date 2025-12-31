import express from "express";
import { loginUser, logoutUser } from "../controllers/authController.js";
import { getDashboardStats } from "../controllers/adminController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const adminRouter = express.Router();

adminRouter.post("/login", loginUser);
adminRouter.post("/logout", logoutUser);

adminRouter.get(
  "/dashboard",
  authenticateToken,
  authorizeRole,
  getDashboardStats
);

export default adminRouter;
