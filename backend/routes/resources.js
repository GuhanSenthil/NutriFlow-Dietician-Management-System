const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const router = express.Router();

// Create Resource
router.post('/', (req, res) => {
    const newResource = { id: uuidv4(), ...req.body };
    db.resources.push(newResource);
    // Also add to the dietician's list
    const dietician = db.users.find(u => u.id === newResource.authorId);
    if (dietician) {
        if (!dietician.resourceIds) dietician.resourceIds = [];
        dietician.resourceIds.push(newResource.id);
    }
    res.status(201).json(newResource);
});

// Get Resources by IDs
router.post('/get-by-ids', (req, res) => {
    const { resourceIds } = req.body;
    if (!resourceIds || !Array.isArray(resourceIds)) {
        return res.status(400).json({ message: 'resourceIds must be an array.' });
    }
    if (resourceIds.length === 0) {
        return res.json([]);
    }
    const foundResources = db.resources.filter(r => resourceIds.includes(r.id));
    res.json(foundResources);
});

// Assign/Unassign Resource
router.post('/assign', (req, res) => {
    const { patientId, resourceId, action } = req.body; // action: 'assign' or 'unassign'
    const patient = db.users.find(u => u.id === patientId);
    if (patient) {
        if (!patient.resourceIds) patient.resourceIds = [];
        if (action === 'assign') {
            if (!patient.resourceIds.includes(resourceId)) {
                patient.resourceIds.push(resourceId);
            }
        } else {
            patient.resourceIds = patient.resourceIds.filter(id => id !== resourceId);
        }
        res.status(200).json({ message: `Resource ${action}ed.` });
    } else {
        res.status(404).json({ message: 'Patient not found' });
    }
});

module.exports = router;
