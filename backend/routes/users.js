const express = require('express');
const db = require('../db');
const router = express.Router();

// Get user by ID
router.get('/:id', (req, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Get users by role (e.g., ?role=DIETICIAN)
router.get('/', (req, res) => {
    const { role } = req.query;
    if (role) {
        const usersByRole = db.users.filter(u => u.role === role);
        const usersWithoutPasswords = usersByRole.map(u => {
            const { password, ...rest } = u;
            return rest;
        });
        res.json(usersWithoutPasswords);
    } else {
        res.status(400).json({ message: 'Role query parameter is required.' });
    }
});

// Get users by IDs (for batch fetching)
router.post('/get-by-ids', (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ message: '`ids` must be an array.' });
    }
    const foundUsers = db.users.filter(u => ids.includes(u.id));
    const usersWithoutPasswords = foundUsers.map(u => {
        const { password, ...rest } = u;
        return rest;
    });
    res.json(usersWithoutPasswords);
});

// Update User
router.patch('/:id', (req, res) => {
    const userIndex = db.users.findIndex(u => u.id === req.params.id);
    if (userIndex > -1) {
        const user = db.users[userIndex];
        
        // Allow updating profile for patients
        if (req.body.profile && user.role === 'PATIENT') {
            user.profile = { ...user.profile, ...req.body.profile };
        }
        
        // Update user fields based on a list of allowed updates
        const allowedUpdates = ['name', 'status', 'specialization', 'bio'];
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                user[key] = req.body[key];
            }
        });

        const { password, ...updatedUser } = user;
        res.json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});


module.exports = router;