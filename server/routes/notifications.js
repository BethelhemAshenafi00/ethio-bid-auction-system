const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/email');

/* =======================
   TEST EMAIL
======================= */
router.get('/test-email', async (req, res) => {
  try {
    console.log('🧪 TEST EMAIL TRIGGERED');

    await sendEmail(
      "your@email.com",
      "Test Email from Auction System",
      "✅ Emails working!"
    );

    res.json({
      success: true,
      message: 'Test email sent'
    });

  } catch (error) {
    console.error('TEST EMAIL ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =======================
   GET MY NOTIFICATIONS
======================= */
router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const notifications = await Notification.find({ user: userId })
      .populate('auction', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });

  } catch (error) {
    console.error('NOTIFICATIONS ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =======================
   MARK ONE AS READ
======================= */
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const notification = await Notification.findById(req.params.id);

    if (!notification || notification.user.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true, data: notification });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =======================
   CLEAR ALL UNREAD
======================= */
router.patch('/clear', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const cleared = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      cleared: cleared.modifiedCount,
      message: `Cleared ${cleared.modifiedCount} notifications`
    });

  } catch (error) {
    console.error('CLEAR ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =======================
   DELETE SINGLE
======================= */
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const cleared = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      cleared: cleared.modifiedCount,
      message: `Cleared ${cleared.modifiedCount} notifications`
    });

  } catch (error) {
    console.error('CLEAR ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;