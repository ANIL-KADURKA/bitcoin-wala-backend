const nodemailer = require('nodemailer');
const Subscriber = require('../models/Subscriber');
const generateAnnouncementEmail = require('./emailTemplate');

EMAIL_USER="kadurkaanil@gmail.com"
EMAIL_PASS="uygw zfoi noai eiap"



// except this guy all ,
// only this guy 
// all 

async function sendAnnouncementEmails(announcement) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });

  // Fetch all active subscribers
  const allSubscribers = await Subscriber.findAll({ where: { is_active: true } });

  // Parse targeting logic
  const emailTargets = announcement.email_targets || { mode: 'all' };
  let recipients = [];

  if (emailTargets.mode === 'all') {
    recipients = allSubscribers;
  } else if (emailTargets.mode === 'include') {
    recipients = allSubscribers.filter(sub => emailTargets.users.includes(sub.id));
  } else if (emailTargets.mode === 'exclude') {
    recipients = allSubscribers.filter(sub => !emailTargets.users.includes(sub.id));
  }

  // Generate email content
  const html = generateAnnouncementEmail(announcement);

  // Send emails
  for (const sub of recipients) {
    await transporter.sendMail({
      from: `"Your App" <${EMAIL_USER}>`,
      to: sub.email,
      subject: announcement.title,
      html
    });
  }

  // Update status
  announcement.is_email_sent = true;
  await announcement.save();
}


module.exports = sendAnnouncementEmails;
