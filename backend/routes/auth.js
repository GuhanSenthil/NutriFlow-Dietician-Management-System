const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const router = express.Router();

// Sign In
router.post('/signin', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(401).json({ message: 'Invalid email or password.' });
    }
});

// Sign Up
router.post('/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    if (db.users.some(u => u.email === email)) {
        return res.status(400).json({ message: 'Email already in use.' });
    }

    let newUser = {
        id: uuidv4(),
        name,
        email,
        password, // Remember to hash in a real app!
        role,
        status: 'active'
    };
    
    if (role === 'PATIENT') {
        newUser = {
            ...newUser,
            applicationStatus: 'NONE',
            profile: {},
        };
    } else {
        newUser = {
            ...newUser,
            specialization: 'General Nutrition',
            bio: 'Newly registered dietician.',
            pendingPatientIds: [],
            acceptedPatientIds: [],
        };
    }
    
    db.users.push(newUser);
    const { password: pw, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

module.exports = router;
