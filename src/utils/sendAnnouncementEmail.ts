import nodemailer from "nodemailer";
import { Subscriber } from "../models/Subscriber";
import generateAnnouncementEmail from "./emailTemplate";
import { Announcement } from "../models/Announcement";
import { SubscriberInstance } from "../types/subscriber.types";

import dotenv from "dotenv";

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER as string;
const EMAIL_PASS = process.env.EMAIL_PASS as string;

interface EmailTargets {
  mode: "all" | "include" | "exclude";
  users?: number[];
}

export default async function sendAnnouncementEmails(
  announcement: Announcement
): Promise<void> {
  console.log("sendinf")
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const allSubscribers: SubscriberInstance[] = (
    await Subscriber.findAll({ where: { is_active: true } })
  ).map((sub) => sub.get() as SubscriberInstance);
  const emailTargets: EmailTargets = {
    mode:  announcement.email_targets || "all" ,
  };
  let recipients: SubscriberInstance[] = [];
  console.log(allSubscribers)

  switch (emailTargets.mode) {
    case "all":
      recipients = allSubscribers;
      break;
    case "include":
      recipients = allSubscribers.filter((sub) =>
        emailTargets.users?.includes(sub.id)
      );
      break;
    case "exclude":
      recipients = allSubscribers.filter(
        (sub) => !emailTargets.users?.includes(sub.id)
      );
      break;
  }

  const html = generateAnnouncementEmail(announcement);

  console.log("html", recipients)

  for (const sub of recipients) {
    await transporter.sendMail({
      from: `"Your App" <${EMAIL_USER}>`,
      to: 'ushasrigudikandula456@gmail.com',
      subject: announcement.title,
      html,
    });
    console.log("email senr")
  }

  announcement.is_email_sent = true;
  await announcement.save();
}
