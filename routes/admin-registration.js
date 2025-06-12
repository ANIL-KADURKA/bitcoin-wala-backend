const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');



const router = express.Router();




router.post('/register-admin', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10); // make sure bcrypt is installed
    const user = await User.create({
      username,
      password: hashed,
      email,
      role: 'admin',
      status: 'pending'
    });
    res.status(201).json({ message: 'Registration submitted. Awaiting approval.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



router.post('/approve-admin/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user || user.role !== 'admin') return res.status(404).json({ message: 'Admin not found' });

    user.status = 'approved';
    await user.save();
    res.json({ message: 'Admin approved successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post('/reject-admin/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await user.destroy();  // Permanently delete the record
    res.json({ message: 'Admin record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/pending-admins', async (req, res) => {
  try {
    const pendingAdmins = await User.findAll({
      where: {
        role: 'admin',
        status: 'pending'
      }
    });

    res.json(pendingAdmins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/active-admins', async (req, res) => {
  try {
    const activeAdmins = await User.findAll({
      where: {
        role: 'admin',
        status: 'approved'
      }
    });

    res.json(activeAdmins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin' && user.status !== 'approved') {
      return res.status(403).json({ message: 'Admin registration not approved yet.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect password' });

    // Generate token or session here
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/request-reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Email not registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiresAt = expires;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is: ${otp}`
    });

    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiresAt) {
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: 'OTP expired' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;


