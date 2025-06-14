import express, { Request, Response } from "express";
import { Announcement } from "../models/Announcement";
import sendAnnouncementEmails from "../utils/sendAnnouncementEmail";

export const announcementRouter = express.Router();

announcementRouter.post("/", async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json(announcement);
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

announcementRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const announcements = await Announcement.findAll();
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

announcementRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(200).json(announcement);
  } catch (error) {
    console.error("Fetch by ID Error:", error);
    res.status(500).json({ error: "Error fetching announcement" });
  }
});

announcementRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const [updated] = await Announcement.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const updatedAnnouncement = await Announcement.findByPk(req.params.id);
    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

announcementRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await Announcement.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

announcementRouter.post("/:id/publish", async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    console.log("gng to ublush")
    if (!announcement) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    announcement.status = "published";
    await announcement.save();

    if (announcement.send_email && !announcement.is_email_sent) {
      console.log("not")
      await sendAnnouncementEmails(announcement);
    }

    res.json(announcement);
  } catch (error) {
    console.error("Publish Error:", error);
    res.status(500).json({ error: "Failed to publish announcement" });
  }
});

announcementRouter.post("/:id/inactive", async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    announcement.status = "inactive";
    await announcement.save();
    res.status(200).json(announcement);
  } catch (error) {
    console.error("Inactive Error:", error);
    res.status(500).json({ error: "Failed to mark inactive" });
  }
});

