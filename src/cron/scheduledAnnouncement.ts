import cron from "node-cron";
import axios from "axios";
import { Op } from "sequelize";
import { Announcement } from "../models/Announcement";
import { Bitcoin } from "../models/BitCoin";
import sendAnnouncementEmails from "../utils/sendAnnouncementEmail";

cron.schedule("*/1 * * * *", async () => {
  try {
    const now = new Date();

    const announcements = await Announcement.findAll({
      where: {
        status: "scheduled",
        schedule_time: {
          [Op.lte]: now,
        },
        send_email: true,
        is_email_sent: false,
      },
    });

    for (const announcement of announcements) {
      announcement.status = "published";
      announcement.is_email_sent = true;
      await announcement.save();

      await sendAnnouncementEmails(announcement);
      console.log(`Sent scheduled announcement: ${announcement.title}`);
    }
  } catch (err: any) {
    console.error("Error in scheduled announcement cron:", err.message);
  }
});

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Fetching Bitcoin data...");

    const [priceRes, detailsRes, chartRes] = await Promise.all([
      axios.get("http://localhost:5000/api/bitcoin/price"),
      axios.get("http://localhost:5000/api/bitcoin/details"),
      axios.get("http://localhost:5000/api/bitcoin/chart?days=7"),
    ]);

    const entries = [
      { json: priceRes.data },
      { json: detailsRes.data },
      { json: chartRes.data },
    ];

    for (const entry of entries) {
      await Bitcoin.create(entry);
    }

    console.log("Bitcoin data saved successfully.");
  } catch (error: any) {
    console.error("Error in Bitcoin cron job:", error.message);
  }
});
