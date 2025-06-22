import express, { Request, Response } from "express";
import { Announcement } from "../models/Announcement";
import sendAnnouncementEmails from "../utils/sendAnnouncementEmail";
import multer from "multer";
import nodemailer from "nodemailer";
import { getEmail } from "../utils/getAdminEmail";
import generateAnnouncementEmail from "../utils/emailTemplate";
import path from "path";
import fs from "fs";

export const announcementRouter = express.Router();

const getImageBase64 = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;
  const fullPath = path.join(__dirname, "../../", imageUrl);
  if (!fs.existsSync(fullPath)) return null;

  const mimeType = `image/${path.extname(fullPath).substring(1)}`;
  const buffer = fs.readFileSync(fullPath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

announcementRouter.post(
  "/:id",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
      const data = {
        ...req.body,
        created_by: Number(req.params.id),
        image_url: imagePath,
      };
      const announcement = await Announcement.create(data);
      const announcementWithImageUrl = {
        ...announcement.toJSON(),
        image: imagePath
          ? `${req.protocol}://${req.get("host")}${imagePath}`
          : null,
        image_data: getImageBase64(imagePath),
      };
      res.status(201).json(announcementWithImageUrl);
    } catch (error) {
      console.error("Create Error:", error);
      res.status(500).json({ error: "Failed to create announcement" });
    }
  }
);

announcementRouter.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const announcements = await Announcement.findAll();
      const enrichedAnnouncements = announcements.map((a: any) => {
        const imagePath = a.image_url || null;
        return {
          ...a.toJSON(),
          image: imagePath
            ? `${req.protocol}://${req.get("host")}${imagePath}`
            : null,
          image_data: getImageBase64(imagePath),
        };
      });
      res.status(200).json(enrichedAnnouncements);
    } catch (error) {
      console.error("Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  }
);

announcementRouter.get(
  "/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const announcement = await Announcement.findByPk(req.params.id);
      if (!announcement) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const imagePath = announcement.image_url || null;
      res.status(200).json({
        ...announcement.toJSON(),
        image: imagePath
          ? `${req.protocol}://${req.get("host")}${imagePath}`
          : null,
        // image_data: getImageBase64(imagePath),
      });
    } catch (error) {
      console.error("Fetch by ID Error:", error);
      res.status(500).json({ error: "Error fetching announcement" });
    }
  }
);

announcementRouter.put(
  "/:id/:announcementId",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const updateData: any = { ...req.body };
      if (req.file) updateData.image_url = `/uploads/${req.file.filename}`;
      if (req.params.id) updateData.created_by = Number(req.params.id);

      const [updated] = await Announcement.update(updateData, {
        where: { id: Number(req.params.announcementId) },
      });

      if (!updated) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      const updatedAnnouncement = await Announcement.findByPk(
        Number(req.params.announcementId)
      );
      const imagePath = updatedAnnouncement?.image_url || null;

      res.status(200).json({
        ...updatedAnnouncement?.toJSON(),
        image: imagePath
          ? `${req.protocol}://${req.get("host")}${imagePath}`
          : null,
        image_data: getImageBase64(imagePath),
      });
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ error: "Failed to update announcement" });
    }
  }
);

announcementRouter.delete(
  "/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const announcement = await Announcement.findByPk(req.params.id);
      if (!announcement) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      if (announcement.image_url) {
        const filename = path.basename(announcement.image_url);
        const imagePath = path.join(__dirname, "..", "..", "uploads", filename);

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Failed to delete image:", err);
          } else {
            console.log("Image deleted:", imagePath);
          }
        });
      }

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
  }
);

announcementRouter.post(
  "/:id/publish",
  async (req: Request, res: Response): Promise<void> => {
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
      console.error("Publish Error:", error);
      res.status(500).json({ error: "Failed to publish announcement" });
    }
  }
);

announcementRouter.post(
  "/:id/inactive",
  async (req: Request, res: Response): Promise<void> => {
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
  async (req: Request, res: Response): Promise<void> => {
    try {
      const announcementId = req.params.announcmentId;
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
        auth: { user: sendingEmail, pass: password },
      });

      await transporter.sendMail({
        from: sendingEmail,
        to: subscriberEmail,
        subject: announcement.title,
        html: generateAnnouncementEmail(announcement, subscriberEmail),
      });

      res.status(200).json({ message: "Email Sent" });
    } catch (error) {
      console.error("Send Mail Error:", error);
      res.status(500).json({ error: "Failed to send mail to subscriber" });
    }
  }
);
