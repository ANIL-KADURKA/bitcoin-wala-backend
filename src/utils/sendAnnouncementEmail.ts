import nodemailer from "nodemailer";
import { Subscriber } from "../models/Subscriber";
import generateAnnouncementEmail from "./emailTemplate";
import { Announcement } from "../models/Announcement";
import { SubscriberInstance } from "../types/subscriber.types";

import dotenv from "dotenv";
import { getEmail } from "./getAdminEmail";

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER as string;
const EMAIL_PASS = process.env.EMAIL_PASS as string;

interface EmailTargets {
  mode: "all" | "include" | "exclude";
  users?: string[];
}

export default async function sendAnnouncementEmails(
  announcement: Announcement
): Promise<void> {
  const allSubscribers: SubscriberInstance[] = (
    await Subscriber.findAll({ where: { is_active: true } })
  ).map((sub) => sub.get() as SubscriberInstance);
  const emailTargets: EmailTargets = {
    mode: announcement.email_targets.mode || "all",
    users:
      announcement.email_targets.mode !== "all"
        ? announcement.email_targets.users
        : allSubscribers,
  };
  let recipients: SubscriberInstance[] = [];
  console.log("et", emailTargets);
  switch (emailTargets.mode) {
    case "all":
      recipients = allSubscribers;
      break;
    case "include":
      recipients = allSubscribers.filter((sub) =>
        emailTargets.users?.includes(sub.email)
      );
      break;
    case "exclude":
      recipients = allSubscribers.filter(
        (sub) => !emailTargets.users?.includes(sub.email)
      );
      break;
  }

  console.log("r", recipients);
  

  const result = await getEmail();

  if (!result) {
    console.log("no result");
    // res.status(503).json({ message: "Service unavailable" });
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

  for (const sub of recipients) {
    console.log("came to send");
    const html = generateAnnouncementEmail(announcement,sub.name || 'there');
    await transporter.sendMail({
      from: `"Your App" <${EMAIL_USER}>`,
      to: sub.email,
      subject: announcement.title,
      html,
    });
  }


  announcement.is_email_sent = true;
  await announcement.save();
  console.log("Sent succesfully")
}
