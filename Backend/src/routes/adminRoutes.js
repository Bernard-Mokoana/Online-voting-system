import express from "express";
import { loginUser, logoutUser } from "../controllers/authController.js";

const adminRouter = express.Router();

adminRouter.post("/login", loginUser);
adminRouter.post("/logout", logoutUser);

export default adminRouter;
