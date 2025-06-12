// routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const sendAnnouncementEmails = require('../utils/sendAnnouncementEmail')


// Create announcement
router.post('/', async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.findAll();
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Get single announcement detailed card view 
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching announcement' });
  }
});

// Update announcement
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Announcement.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    const updatedAnnouncement = await Announcement.findByPk(req.params.id);
    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Announcement.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});


router.post('/:id/publish', async (req, res) => {
  const announcement = await Announcement.findByPk(req.params.id);

  announcement.status = 'published';
  await announcement.save();

  if (announcement.send_email && !announcement.is_email_sent) {
    await sendAnnouncementEmails(announcement);
  }

  res.json(announcement);
});

// Mark as inactive
router.post('/:id/inactive', async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Not found' });

    announcement.status = 'inactive';
    await announcement.save();
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark inactive' });
  }
});

module.exports = router;
