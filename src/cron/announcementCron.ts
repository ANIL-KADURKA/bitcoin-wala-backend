import cron from "node-cron";
import { runAnnouncementCron } from "../utils/cronHandlers";

cron.schedule("50 17 * * *", async () => {
  console.log("🔁 Running scheduled announcement cron...");

  try {
    const count = await runAnnouncementCron();
    console.log(`Scheduled announcements sent: ${count}`);
  } catch (err: any) {
    console.error("Error in scheduled announcement cron:", err.message);
  }
});
