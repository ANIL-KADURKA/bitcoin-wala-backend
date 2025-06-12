// // Full working backend code to connect to PostgreSQL, create tables, and expose APIs
// // Tech: Node.js + Express + Sequelize + PostgreSQL + Nodemailer

// const express = require('express');
// const { Sequelize, DataTypes } = require('sequelize');
// const nodemailer = require('nodemailer');
// const cors = require('cors');
// const dotenv = require('dotenv');
// require('./cron/scheduledAnnouncement');

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());

// ///////////////////// DB CONNECTION /////////////////////
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false // for Neon/Supabase with self-signed certs
//     }
//   },
//   logging: false
// });

// // Models
// const Announcement = sequelize.define('Announcement', {
//   title: DataTypes.STRING,
//   description: DataTypes.TEXT,
//   image_url: DataTypes.STRING,
//   schedule_time: DataTypes.DATE,
//   is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
// });

// const Subscriber = sequelize.define('Subscriber', {
//   email: { type: DataTypes.STRING, unique: true },
//   name: DataTypes.STRING,
//   phone: DataTypes.STRING,
//   organization: DataTypes.STRING,
//   is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
// });



// ///////////////////// EMAIL SETUP /////////////////////
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// ///////////////////// ROUTES /////////////////////

// // GET all subscribers
// app.get('/api/subscribers', async (req, res) => {
//   const subscribers = await Subscriber.findAll({ where: { is_active: true } });
//   res.json(subscribers);
// });

// // POST create announcement
// app.post('/api/announcements', async (req, res) => {
//   const announcement = await Announcement.create(req.body);
//   res.json(announcement);
// });

// // GET all announcements
// app.get('/api/announcements', async (req, res) => {
//   const list = await Announcement.findAll();
//   res.json(list);
// });

// // PUT update announcement
// app.put('/api/announcements/:id', async (req, res) => {
//   const { id } = req.params;
//   await Announcement.update(req.body, { where: { id } });
//   const updated = await Announcement.findByPk(id);
//   res.json(updated);
// });

// // DELETE announcement
// app.delete('/api/announcements/:id', async (req, res) => {
//   const { id } = req.params;
//   await Announcement.destroy({ where: { id } });
//   res.json({ deleted: true });
// });

// // POST send email (bulk or one)
// app.post('/api/send-newsletter', async (req, res) => {
//   const { emails, subject, htmlTemplate } = req.body;

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: emails,
//     subject,
//     html: htmlTemplate
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.json({ sent: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ sent: false, error: err.message });
//   }
// });

// ///////////////////// ROOT & START /////////////////////
// app.get('/', (req, res) => {
//   res.send('Newsletter API running ✅');
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, async () => {
//   try {
//     await sequelize.authenticate();
//     await sequelize.sync();
//     console.log('✅ Connected to PostgreSQL and tables are synced.');
//     console.log(`🚀 Server running at http://localhost:${PORT}`);
//   } catch (err) {
//     console.error('❌ Database connection error:', err);
//   }
// });