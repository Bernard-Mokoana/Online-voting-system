import express from "express";
import { createVoter, getAllVoters } from "../models/voterModel.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const voter = await createVoter(req.body);
    res.status(201).json(voter);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create voter" });
  }
});

router.get("/", async (req, res) => {
  try {
    const voters = await getAllVoters();
    res.json(voters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve voters" });
  }
});

export default router;
