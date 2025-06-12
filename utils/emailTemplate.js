function generateAnnouncementEmail(announcement) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

          <!-- Logo -->
          <div style="text-align: center;">
            <img src="https://yourdomain.com/assets/logo.png" alt="Your Company Logo" style="height: 60px; margin-bottom: 20px;">
          </div>

          <!-- Greeting -->
          <p style="font-size: 1.1em;">Hi there,</p>
          <p>We’ve got a new update for you. Please find the details of the latest announcement below:</p>

          <!-- Announcement Content -->
          <h2 style="color: #2a7ae2;">${announcement.title}</h2>
          <p>${announcement.description}</p>

          <p><strong>Scheduled Time:</strong> ${new Date(announcement.schedule_time).toLocaleString()}</p>
          <p><strong>Expiry Date:</strong> ${new Date(announcement.expiry_date).toLocaleString()}</p>

          <hr style="margin: 30px 0;">

          <!-- Contact & Social -->
          <div style="text-align: center; font-size: 0.9em;">
            <p>Stay connected with us:</p>
            <p>
              <a href="https://facebook.com/yourpage" style="margin: 0 10px; text-decoration: none;">Facebook</a> |
              <a href="https://twitter.com/yourhandle" style="margin: 0 10px; text-decoration: none;">Twitter</a> |
              <a href="https://linkedin.com/company/yourcompany" style="margin: 0 10px; text-decoration: none;">LinkedIn</a>
            </p>
            <p>Contact us at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></p>
          </div>

          <!-- Unsubscribe -->
          <div style="text-align: center; font-size: 0.8em; color: #888; margin-top: 40px;">
            <p>If you no longer wish to receive these emails, you can <a href="https://yourdomain.com/unsubscribe?email=__EMAIL__" style="color: #2a7ae2;">unsubscribe here</a>.</p>
          </div>

          <!-- Footer -->
          <p style="font-size: 0.75em; color: #aaa; text-align: center; margin-top: 30px;">
            You received this email because you're subscribed to announcements from organization name .<br>
            &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
}

module.exports = generateAnnouncementEmail;
