import express, { Request, Response } from "express";
import { Subscriber } from "../models/Subscriber";
import nodemailer from "nodemailer";
import { getEmail } from "../utils/getAdminEmail";

export const subscriptionRouter = express.Router();

subscriptionRouter.post(
  "/create-subscriber",
  async (req: Request, res: Response) => {
    try {
      const { email, name, phone, organization } = req.body;

      const [subscriber, created] = await Subscriber.findOrCreate({
        where: { email },
        defaults: {
          email,
          name,
          phone,
          organization,
          is_active: true,
          is_subscribed: true,
        },
      });

      if (!created) {
        res.status(400).json({ message: "Subscriber already exists." });
        return;
      }

      res.status(201).json(subscriber);
    } catch (error) {
      console.error("Error creating subscriber:", error);
      res.status(500).json({ error: "Failed to subscribe." });
    }
  }
);

// Unsubscribe
subscriptionRouter.post("/unsubscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const subscriber = await Subscriber.findOne({ where: { email } });

    if (!subscriber) {
      res.status(404).json({ message: "Subscriber not found." });
      return;
    }

    subscriber.is_active = false;
    subscriber.is_subscribed = false;
    await subscriber.save();

    res.json({ message: "Unsubscribed successfully." });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({ error: "Failed to unsubscribe." });
  }
});

// Resubscribe
subscriptionRouter.post("/resubscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const subscriber = await Subscriber.findOne({ where: { email } });

    if (!subscriber) {
      res.status(404).json({ message: "Subscriber not found." });
      return;
    }

    if (subscriber.is_active && subscriber.is_subscribed) {
      res.status(200).json({ message: "You are already subscribed." });
      return;
    }

    subscriber.is_active = true;
    subscriber.is_subscribed = true;
    await subscriber.save();

    res.json({ message: "You have successfully resubscribed." });
  } catch (error) {
    console.error("Error resubscribing:", error);
    res.status(500).json({ error: "Failed to resubscribe." });
  }
});

// Delete subscriber
subscriptionRouter.delete(
  "/subscriber/:email",
  async (req: Request, res: Response) => {
    try {
      const { email } = req.params;

      const deletedCount = await Subscriber.destroy({ where: { email } });

      if (deletedCount === 0) {
        res.status(404).json({ message: "Subscriber not found." });
        return;
      }

      res.json({ message: "Subscriber deleted permanently." });
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      res.status(500).json({ error: "Failed to delete subscriber." });
    }
  }
);

// Update subscriber
subscriptionRouter.put(
  "/subscriber/:email",
  async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      const { name, phone, organization } = req.body;

      const subscriber = await Subscriber.findOne({ where: { email } });

      if (!subscriber) {
        res.status(404).json({ message: "Subscriber not found." });
        return;
      }

      subscriber.name = name || subscriber.name;
      subscriber.phone = phone || subscriber.phone;
      subscriber.organization = organization || subscriber.organization;

      await subscriber.save();

      res.json({ message: "Subscriber updated successfully." });
    } catch (error) {
      console.error("Error updating subscriber:", error);
      res.status(500).json({ error: "Failed to update subscriber." });
    }
  }
);

subscriptionRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const subscribers = await Subscriber.findAll();
    res.status(200).json(subscribers);
  } catch (error) {
    console.error("Fetch subscribers error:", error);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

subscriptionRouter.patch(
  "/:id/toggle-active",
  async (req: Request, res: Response) => {
    try {
      const subscriber = await Subscriber.findByPk(req.params.id);

      if (!subscriber) {
        res.status(404).json({ error: "Subscriber not found" });
        return;
      }

      subscriber.is_active = !subscriber.is_active;
      await subscriber.save();

      res.status(200).json(subscriber);
    } catch (error) {
      console.error("Toggle active error:", error);
      res.status(500).json({ error: "Failed to toggle active status" });
    }
  }
);

subscriptionRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await Subscriber.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      res.status(404).json({ error: "Subscriber not found" });
      return;
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete subscriber" });
  }
});

subscriptionRouter.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, phone, organization } = req.body;

    const [subscriber, created] = await Subscriber.findOrCreate({
      where: { email },
      defaults: {
        email,
        name: `${firstName} ${lastName}`,
        phone,
        organization,
        is_active: true,
        is_subscribed: true,
      },
    });
    if (!created) {
      res.status(400).json({ message: "Subscriber already exists." });
      return;
    }

    const result = await getEmail();

    if (!result) {
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
      to: email,
      subject: "Subscription Confirmation - Welcome to Bitcoinwala!",
      html: `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f9f9f9; border: 1px solid #e0e0e0;">
    <h2 style="color: #333;">Thank You for Subscribing! ${email}</h2>
    <p style="font-size: 16px; color: #555;">
      We're excited to have you on board at <strong>Bitcoinwala.co</strong>! 🎉
    </p>
    <p style="font-size: 16px; color: #555;">
      You'll now receive timely updates, insights, and alerts related to everything Bitcoin and crypto.
    </p>
    <p style="font-size: 16px; color: #555;">
      If you didn’t sign up, please ignore this email.
    </p>
    <p style="font-size: 16px; color: #888; margin-top: 20px;">
      — The Bitcoinwala Team
    </p>
  </div>
`,
    });
    await transporter.sendMail({
      from: sendingEmail,
      to: sendingEmail,
      subject: "New Subscriber Alert - Bitcoinwala.co",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #fffbe6; border: 1px solid #ffe58f;">
          <h2 style="color: #ad6800;">🚨 New Subscriber Notification</h2>
          <p style="font-size: 16px; color: #333;">
            A new user has just subscribed to <strong>Bitcoinwala.co</strong>.
          </p>
          <p style="font-size: 16px; color: #333;">
            <strong>Subscriber Email:</strong> ${email}
          </p>
          <p style="font-size: 16px; color: #333;">
            <strong>Subscription Time:</strong> ${phone}
          </p>
          <p style="font-size: 16px; color: #888; margin-top: 20px;">
            — This is an automated alert from the Bitcoinwala system.
          </p>
        </div>
      `,
    });
    res.status(201).json(subscriber);
  } catch (error) {
    console.error("Error creating subscriber:", error);
    res.status(500).json({ error: "Failed to subscribe." });
  }
});
