import express, { Request, Response } from "express";
import { Bitcoin } from "../models/BitCoin";

export const bitcoinRouter = express.Router();


bitcoinRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { json } = req.body;

    if (!json) {
      res.status(400).json({ error: "JSON data is required." });
      return;
    }

    const newEntry = await Bitcoin.create({ json });

    res.status(201).json({
      message: "Bitcoin data saved successfully.",
      data: newEntry,
    });
  } catch (err) {
    console.error("Error saving Bitcoin data:", err);
    res.status(500).json({ error: "Failed to save Bitcoin data." });
  }
});
