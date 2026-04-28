const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const router = express.Router();

const createNotification = (userId, message, type = 'system') => {
    const newNotif = {
        id: `notif-${uuidv4()}`,
        userId,
        message,
        read: false,
        timestamp: Date.now(),
        type,
    };
    db.notifications.push(newNotif);
};


// Send Broadcast
router.post('/broadcast', (req, res) => {
    const { message, targetRole } = req.body;
    if (!message || !targetRole) {
        return res.status(400).json({ message: 'Message and targetRole are required.' });
    }

    const newBroadcast = {
        id: uuidv4(),
        message,
        targetRole,
        timestamp: Date.now(),
    };
    db.broadcasts.push(newBroadcast);

    // Create individual notifications for each user in the target role
    db.users.forEach(user => {
        if (user.role === targetRole) {
            createNotification(user.id, message, 'broadcast');
        }
    });

    console.log(`Broadcast sent to ${targetRole}s: "${message}"`);
    res.status(201).json(newBroadcast);
});

module.exports = router;