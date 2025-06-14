import { Op } from "sequelize";
import { Announcement } from "../models/Announcement";
import sendAnnouncementEmails from "./sendAnnouncementEmail";

export const runAnnouncementCron = async () => {
  const now = new Date();

  const announcements = await Announcement.findAll({
    where: {
      status: "scheduled",
      schedule_time: { [Op.lte]: now },
      send_email: true,
      is_email_sent: false,
    },
  });

  for (const announcement of announcements) {
    announcement.status = "published";
    announcement.is_email_sent = true;
    await announcement.save();
    await sendAnnouncementEmails(announcement);
  }
  return announcements.length;
};


