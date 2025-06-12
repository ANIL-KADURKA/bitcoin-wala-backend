const express = require('express');
const router = express.Router();
const { Bitcoin } = require('../models/BitCoin'); // adjust this path as needed

// POST /bitcoin - Save JSON data to DB
router.post('/bitcoin', async (req, res) => {
  try {
    const { json } = req.body;

    if (!json) {
      return res.status(400).json({ error: 'JSON data is required.' });
    }

    const newEntry = await Bitcoin.create({ json });

    res.status(201).json({
      message: 'Bitcoin data saved successfully.',
      data: newEntry
    });
  } catch (err) {
    console.error('Error saving Bitcoin data:', err);
    res.status(500).json({ error: 'Failed to save Bitcoin data.' });
  }
});

module.exports = router;
