import express, { Request, Response } from "express";
import { Announcement } from "../models/Announcement";
import sendAnnouncementEmails from "../utils/sendAnnouncementEmail";
import multer from "multer";
import nodemailer from "nodemailer";
import { getEmail } from "../utils/getAdminEmail";
import generateAnnouncementEmail from "../utils/emailTemplate";

export const announcementRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

announcementRouter.get("/:id/image", async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement || !announcement.image_data) {
      res.status(404).send("Image not found");
      return;
    }
    res.set("Content-Type", "image/jpeg");
    res.send(announcement.image_data);
  } catch (error) {
    console.error("Fetch Image Error:", error);
    res.status(500).send("Error retrieving image");
  }
});

announcementRouter.post(
  "/:id",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const buffer = req.file ? req.file.buffer : null;
      const data = {
        ...req.body,
        created_by: Number(req.params.id),
        image_data: buffer,
      };
      const announcement = await Announcement.create(data);
      const announcementWithImageUrl = {
        ...announcement.toJSON(),
        image: `${req.protocol}://${req.get("host")}/announcement/${
          announcement.id
        }/image`,
      };

      res.status(201).json(announcementWithImageUrl);
    } catch (error) {
      res.status(500).json({ error: "Failed to create announcement" });
    }
  }
);

announcementRouter.get("/", async (req: Request, res: Response) => {
  try {
    const announcements = await Announcement.findAll();
    const enrichedAnnouncements = announcements.map((a: any) => ({
      ...a.toJSON(),
      image: a.image_data
        ? `${req.protocol}://${req.get("host")}/announcement/${a.id}/image`
        : null,
    }));
    res.status(200).json(enrichedAnnouncements);
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

announcementRouter.put(
  "/:id/:announcementId",
  upload.single("image"),
  async (req: Request, res) => {
    try {
      const updateData: any = {};
      const fields = req.body;

      if (fields.title) updateData.title = fields.title;
      if (fields.description) updateData.description = fields.description;
      if (fields.status) updateData.status = fields.status;
      if (fields.schedule_time) updateData.schedule_time = fields.schedule_time;
      if (fields.expiry_date) updateData.expiry_date = fields.expiry_date;
      if (fields.show_on_dashboard !== undefined) {
        updateData.show_on_dashboard = fields.show_on_dashboard;
      }
      if (fields.send_email !== undefined) {
        updateData.send_email = fields.send_email;
      }
      if (req.params.id) {
        updateData.created_by = Number(req.params.id);
      }
      if (req.file) {
        updateData.image_data = req.file.buffer;
      }

      const [updated] = await Announcement.update(updateData, {
        where: { id: Number(req.params.announcementId) },
      });

      if (!updated) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      console.log(updated);
      const updatedAnnouncement = await Announcement.findByPk(
        Number(req.params.announcementId)
      );

      const updatedAnnouncementWithImageUrl = {
        ...updatedAnnouncement?.toJSON(),
        image: `${req.protocol}://${req.get("host")}/announcement/${
          updatedAnnouncement!.id
        }/image`,
      };
      console.log("woth url", updatedAnnouncementWithImageUrl);
      res.status(200).json(updatedAnnouncementWithImageUrl);
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ error: "Failed to update announcement" });
    }
  }
);
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
    if (!announcement) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    announcement.status = "published";
    await announcement.save();

    if (announcement.send_email && !announcement.is_email_sent) {
      await sendAnnouncementEmails(announcement);
    }
    res.json(announcement);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to publish announcement" });
  }
});

announcementRouter.post(
  "/:id/inactive",
  async (req: Request, res: Response) => {
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
  }
);

announcementRouter.post(
  "/subscriber/:announcmentId",
  async (req: Request, res: Response) => {
    try {
      const announcementId = req.params.announcmentId;
      const subscriberId = req.body.subscriberId;
      const subscriberEmail = req.body.subscriberEmail;
      const result = await getEmail();

      const announcement = await Announcement.findByPk(announcementId);
      if (!result || !announcement) {
        res
          .status(503)
          .json({ message: "Service unavailable. Please try again later" });
        return;
      }

      const { sendingEmail, password } = result;

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: sendingEmail,
          pass: password,
        },
      });

      await transporter.sendMail({
        from: sendingEmail,
        to: subscriberEmail,
        subject: announcement.title,
        html: generateAnnouncementEmail(announcement, subscriberEmail),
      });
      res.status(200).json({"message":"Email Sent"});
    } catch (error) {
      console.error("Inactive Error:", error);
      res.status(500).json({ error: "Failed to send mail to subscriber" });
    }
  }
);
