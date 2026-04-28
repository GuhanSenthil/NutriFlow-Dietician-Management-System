const express = require('express');
const db = require('../db');
const router = express.Router();

// Get notifications for a specific user
router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    const userNotifications = db.notifications.filter(n => n.userId === userId);
    res.json(userNotifications);
});

// Mark all notifications as read for a user
router.post('/mark-read', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    db.notifications.forEach(n => {
        if (n.userId === userId) {
            n.read = true;
        }
    });

    res.status(200).json({ message: 'Notifications marked as read.' });
});

module.exports = router;