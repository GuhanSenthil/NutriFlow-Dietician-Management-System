const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const router = express.Router();

// NOTE: For a real application, WebSockets (e.g., using Socket.IO) are
// the correct technology for real-time chat, not HTTP polling.
// This is a simplified simulation.

// Get Messages for a chat
router.get('/:chatId', (req, res) => {
    const { chatId } = req.params;
    const messages = db.chats[chatId] || [];
    res.json(messages);
});

// Send a new message
router.post('/:chatId', (req, res) => {
    const { chatId } = req.params;
    const { text, senderId, receiverId, timestamp } = req.body;

    if (!text || !senderId || !receiverId || !timestamp) {
        return res.status(400).json({ message: 'Missing required message fields.' });
    }
    
    if (!db.chats[chatId]) {
        db.chats[chatId] = [];
    }

    const newMessage = {
        id: uuidv4(),
        text,
        senderId,
        receiverId,
        timestamp,
    };

    db.chats[chatId].push(newMessage);
    res.status(201).json(newMessage);
});

module.exports = router;
