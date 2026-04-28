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

// Apply to Dietician
router.post('/apply', (req, res) => {
    const { patientId, dieticianId } = req.body;
    const dietician = db.users.find(u => u.id === dieticianId && u.role === 'DIETICIAN');
    const patient = db.users.find(u => u.id === patientId && u.role === 'PATIENT');

    if (dietician && patient) {
        if (!dietician.pendingPatientIds.includes(patientId)) {
            dietician.pendingPatientIds.push(patientId);
        }
        patient.applicationStatus = 'PENDING';
        
        createNotification(dieticianId, `You have a new patient application from ${patient.name}.`, 'application');
        
        res.status(200).json({ message: 'Application successful.' });
    } else {
        res.status(404).json({ message: 'Patient or Dietician not found.' });
    }
});

// Handle Application
router.post('/handle-application', (req, res) => {
    const { dieticianId, patientId, action } = req.body;
    const dietician = db.users.find(u => u.id === dieticianId);
    const patient = db.users.find(u => u.id === patientId);

    if (dietician && patient) {
        dietician.pendingPatientIds = dietician.pendingPatientIds.filter(id => id !== patientId);
        if (action === 'accept') {
            if (!dietician.acceptedPatientIds.includes(patientId)) {
                dietician.acceptedPatientIds.push(patientId);
            }
            patient.applicationStatus = 'ACCEPTED';
            patient.assignedDieticianId = dieticianId;
            createNotification(patientId, `Your application has been accepted by ${dietician.name}.`, 'application');
        } else {
            patient.applicationStatus = 'REJECTED';
            createNotification(patientId, `Your application has been reviewed by ${dietician.name}.`, 'application');
        }
        res.status(200).json({ message: `Application ${action}ed.` });
    } else {
        res.status(404).json({ message: 'Patient or Dietician not found.' });
    }
});

// Add Progress Log
router.post('/patients/:id/progress', (req, res) => {
    const patient = db.users.find(u => u.id === req.params.id);
    if (patient) {
        const newEntry = { id: `progress-${Date.now()}`, ...req.body };
        if (!patient.progressLog) patient.progressLog = [];
        patient.progressLog.push(newEntry);
        res.status(201).json(newEntry);
    } else {
        res.status(404).json({ message: 'Patient not found' });
    }
});

// Add Symptom Log
router.post('/patients/:id/symptoms', (req, res) => {
    const patient = db.users.find(u => u.id === req.params.id && u.role === 'PATIENT');
    if (patient) {
        const newSymptom = { 
            id: `symptom-${Date.now()}`, 
            date: new Date().toISOString(),
            ...req.body 
        };
        if (!patient.symptomLog) patient.symptomLog = [];
        patient.symptomLog.push(newSymptom);
        res.status(201).json(newSymptom);
    } else {
        res.status(404).json({ message: 'Patient not found' });
    }
});

// Add Food Diary Entry
router.post('/patients/:id/food-diary', (req, res) => {
    const patient = db.users.find(u => u.id === req.params.id && u.role === 'PATIENT');
    if (patient) {
        const { date, meals } = req.body;
        if (!patient.foodDiary) patient.foodDiary = [];
        
        const existingEntryIndex = patient.foodDiary.findIndex(entry => entry.date === date);
        if (existingEntryIndex > -1) {
            patient.foodDiary[existingEntryIndex].meals = { ...patient.foodDiary[existingEntryIndex].meals, ...meals };
        } else {
            const newEntry = { id: `diary-${uuidv4()}`, date, meals };
            patient.foodDiary.push(newEntry);
        }
        res.status(201).json(patient.foodDiary);
    } else {
        res.status(404).json({ message: 'Patient not found' });
    }
});

// Add Goal
router.post('/patients/:id/goals', (req, res) => {
    const patient = db.users.find(u => u.id === req.params.id && u.role === 'PATIENT');
    if (patient) {
        const newGoal = { id: `goal-${uuidv4()}`, completed: false, ...req.body };
        if (!patient.goals) patient.goals = [];
        patient.goals.push(newGoal);
        res.status(201).json(newGoal);
    } else {
        res.status(404).json({ message: 'Patient not found' });
    }
});


// Update Diet Plan
router.patch('/patients/:id/diet-plan', (req, res) => {
    const patient = db.users.find(u => u.id === req.params.id);
    if (patient) {
        const { dietPlan } = req.body;
        if (dietPlan === undefined) {
            return res.status(400).json({ message: 'Request body must contain a dietPlan object.' });
        }
        patient.dietPlan = dietPlan;
        res.status(200).json(patient.dietPlan);
    } else {
        res.status(404).json({ message: 'Patient not found' });
    }
});

// Get appointments for a dietician
router.get('/appointments/:dieticianId', (req, res) => {
    const { dieticianId } = req.params;
    const appointments = db.appointments.filter(a => a.dieticianId === dieticianId);
    res.json(appointments);
});

// Book an appointment
router.post('/appointments/book', (req, res) => {
    const { patientId, dieticianId, dateTime } = req.body;
    const patient = db.users.find(u => u.id === patientId);
    const dietician = db.users.find(u => u.id === dieticianId);

    if (!patient || !dietician) {
        return res.status(404).json({ message: 'Patient or dietician not found.' });
    }
    
    // Check if slot is available and remove it
    const slotIndex = dietician.availableSlots.findIndex(s => s === dateTime);
    if (slotIndex === -1) {
        return res.status(400).json({ message: 'This time slot is no longer available.' });
    }
    dietician.availableSlots.splice(slotIndex, 1);

    const newAppointment = {
        id: `appt-${uuidv4()}`,
        patientId,
        patientName: patient.name,
        dieticianId,
        dateTime,
        status: 'confirmed',
    };
    db.appointments.push(newAppointment);

    // Notify the dietician
    createNotification(dieticianId, `New appointment booked by ${patient.name} for ${new Date(dateTime).toLocaleString()}.`, 'appointment');

    res.status(201).json(newAppointment);
});

module.exports = router;