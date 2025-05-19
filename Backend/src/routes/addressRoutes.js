// src/routes/addressRoutes.js
import express from "express";
import { createAddress, getAllAddresses } from "../models/addressModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const address = await createAddress(req.body);
    res.status(201).json(address);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create address" });
  }
});

router.get("/", async (req, res) => {
  try {
    const addresses = await getAllAddresses();
    res.json(addresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
});

export default router;
