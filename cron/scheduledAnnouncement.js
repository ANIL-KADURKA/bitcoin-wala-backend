const cron = require('node-cron');
const Announcement = require('../models/Announcement');
const sendAnnouncementEmails = require('../utils/sendAnnouncementEmails');
const axios = require('axios');
const { Bitcoin } = require('../models/BitCoin'); 


cron.schedule('*/1 * * * *', async () => {
  try {
    const now = new Date();

    const announcements = await Announcement.findAll({
      where: {
        status: 'scheduled',
        schedule_time: { [Op.lte]: now },
        send_email: true,
        is_email_sent: false
      }
    });

    for (const announcement of announcements) {
      announcement.status = 'published';
      await announcement.save();

      await sendAnnouncementEmails(announcement);
      console.log(`✅ Sent scheduled announcement: ${announcement.title}`);
    }
  } catch (err) {
    console.error('❌ Error in scheduled announcement cron:', err.message);
  }
});


cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Fetching Bitcoin data...');

    const [priceRes, detailsRes, chartRes] = await Promise.all([
      axios.get('http://localhost:5000/api/bitcoin/price'),
      axios.get('http://localhost:5000/api/bitcoin/details'),
      axios.get('http://localhost:5000/api/bitcoin/chart?days=7'),
    ]);

    const entries = [
      { type: 'price', json: priceRes.data },
      { type: 'details', json: detailsRes.data },
      { type: 'chart', json: chartRes.data },
    ];

    for (const entry of entries) {
      await Bitcoin.create(entry);
    }

    console.log('Bitcoin data saved successfully.');
  } catch (error) {
    console.error('Error in cron job:', error.message);
  }
});
