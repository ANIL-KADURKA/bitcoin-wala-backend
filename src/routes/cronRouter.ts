import express from "express";
import { runAnnouncementCron } from "../utils/cronHandlers";

export const cronRouter = express.Router();

cronRouter.post("/trigger-announcements", async (req, res) => {
  try {
    const count = await runAnnouncementCron();
    res.json({ message: `Manually triggered. ${count} emails sent.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
