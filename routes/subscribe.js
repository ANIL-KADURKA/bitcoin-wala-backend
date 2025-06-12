const express = require('express');
const router = express.Router();



router.post('/create-subscriber', async (req, res) => {
  try {
    const { email, name, phone, organization } = req.body;

    const [subscriber, created] = await Subscriber.findOrCreate({
      where: { email },
      defaults: {
        name,
        phone,
        organization,
        is_active: true,
        is_subscribed: true,
      }
    });

    if (!created) {
      return res.status(400).json({ message: "Subscriber already exists." });
    }

    res.status(201).json(subscriber);
  } catch (error) {
    console.error('Error creating subscriber:', error);
    res.status(500).json({ error: 'Failed to subscribe.' });
  }
});


router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Subscriber.findOne({ where: { email } });

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    subscriber.is_active = false;
    subscriber.is_subscribed = false;
    await subscriber.save();

    res.json({ message: "Unsubscribed successfully." });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe.' });
  }
});


router.post('/resubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Subscriber.findOne({ where: { email } });

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    if (subscriber.is_active && subscriber.is_subscribed) {
      return res.status(200).json({ message: "You are already subscribed." });
    }

    subscriber.is_active = true;
    subscriber.is_subscribed = true;

    await subscriber.save();

    res.json({ message: "You have successfully resubscribed." });
  } catch (error) {
    console.error('Error resubscribing:', error);
    res.status(500).json({ error: 'Failed to resubscribe.' });
  }
});



router.delete('/subscriber/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const deletedCount = await Subscriber.destroy({ where: { email } });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    res.json({ message: "Subscriber deleted permanently." });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ error: 'Failed to delete subscriber.' });
  }
});


router.put('/subscriber/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { name, phone, organization } = req.body;

    const subscriber = await Subscriber.findOne({ where: { email } });

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    subscriber.name = name || subscriber.name;
    subscriber.phone = phone || subscriber.phone;
    subscriber.organization = organization || subscriber.organization;

    await subscriber.save();

    res.json({ message: "Subscriber updated successfully." });
  } catch (error) {
    console.error('Error updating subscriber:', error);
    res.status(500).json({ error: 'Failed to update subscriber.' });
  }
});
