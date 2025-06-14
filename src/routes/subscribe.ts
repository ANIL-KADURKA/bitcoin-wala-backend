import express, { Request, Response } from "express";
import { Subscriber } from "../models/Subscriber"; 

export const subscriptionRoouter = express.Router();


subscriptionRoouter.post("/create-subscriber", async (req: Request, res: Response) => {
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
});

// Unsubscribe
subscriptionRoouter.post("/unsubscribe", async (req: Request, res: Response) => {
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
subscriptionRoouter.post("/resubscribe", async (req: Request, res: Response) => {
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
subscriptionRoouter.delete("/subscriber/:email", async (req: Request, res: Response) => {
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
});

// Update subscriber
subscriptionRoouter.put("/subscriber/:email", async (req: Request, res: Response) => {
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
});

