import fs from 'fs';
interface Announcement {
  title: string;
  description: string;
  schedule_time: string | Date;
  expiry_date: string | Date;
}

export default function generateAnnouncementEmail(announcement: Announcement,name:string): string {

  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

          <!-- Logo -->
          <div style="text-align: center;">
            <img src="https://cdn.pixabay.com/photo/2017/07/27/21/37/bitcoin-2546854_1280.png" alt="Your Company Logo" style="height: 60px; margin-bottom: 20px;">
          </div>

          <!-- Greeting -->
          <p style="font-size: 1.1em;">Hi ${name},</p>
          <p>We’ve got a new update for you. Please find the details of the latest announcement below:</p>

          <!-- Announcement Content -->
          <h2 style="color: #2a7ae2;">${announcement.title}</h2>
          <p>${announcement.description}</p>

          <hr style="margin: 30px 0;">

          <!-- Contact & Social -->
          <div style="text-align: center; font-size: 0.9em;">
            <p>Stay connected with us:</p>
            <p>
              <a href="https://t.me/bitcoinwalax" style="margin: 0 10px; text-decoration: none;">Telegram</a> |
              <a href="https://x.com/Bitcoinwalax?t=pR2Fmib9FeSt6f_PGjGBMQ&s=09" style="margin: 0 10px; text-decoration: none;">Twitter</a> |
              <a href="https://www.linkedin.com/company/bitcoinwalaofficial" style="margin: 0 10px; text-decoration: none;">LinkedIn</a>
            </p>
            <p>Contact us at <a href="mailto:hello@bitcoinwala.ai">hello@bitcoinwala.ai</a></p>
          </div>

          <!-- Unsubscribe -->
          <div style="text-align: center; font-size: 0.8em; color: #888; margin-top: 40px;">
            <p>If you no longer wish to receive these emails, you can <a href="https://bitcoinwala.ai/unsubscribe?email=__EMAIL__" style="color: #2a7ae2;">unsubscribe here</a>.</p>
          </div>
          <!-- Footer -->
          <p style="font-size: 0.75em; color: #aaa; text-align: center; margin-top: 30px;">
            You received this email because you're subscribed to announcements from Bitcoinwala.<br>
            &copy; ${new Date().getFullYear()} Bitcoinwala. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
}
