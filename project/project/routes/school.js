const express = require('express');
const router = express.Router();
const School = require('../models/School'); // Adjust the path if necessary


// Create a new school

router.post('/schools/create', async (req, res) => {
    try {
        const { name, address, phone } = req.body;

        // Ensure the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Only admins can create schools.' });
        }

        // Validate required fields
        if (!name || !address || !phone) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        // Create the school
        const newSchool = new School({ name, address, phone });
        await newSchool.save();

        res.status(201).json({ message: 'School created successfully', school: newSchool });
    } catch (error) {
        console.error(`Error creating school: ${error.message}`);
        res.status(500).json({ message: 'Failed to create school', error: error.message });
    }
});

// Get all schools
router.get('/schools', async (req, res) => {
    console.log('about this ')
    try {
        const schools = await School.find();
        console.log('i am here ',schools)
        res.status(200).json(schools);
    } catch (error) {
        console.error(`Error fetching schools: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch schools', error: error.message });
    }
});

// Get a single school by ID
router.get('/schools/:id', async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).json({ msg: 'School not found' });
        }
        res.status(200).json(school);
    } catch (error) {
        console.error(`Error fetching school: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch school', error: error.message });
    }
});

// Update a school
router.put('/schools/:id', async (req, res) => {
    try {
        const { name, address, phone } = req.body;

        // Ensure the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Only admins can update schools.' });
        }

        const updatedSchool = await School.findByIdAndUpdate(
            req.params.id,
            { name, address, phone },
            { new: true }
        );

        if (!updatedSchool) {
            return res.status(404).json({ msg: 'School not found' });
        }

        res.status(200).json({ message: 'School updated successfully', school: updatedSchool });
    } catch (error) {
        console.error(`Error updating school: ${error.message}`);
        res.status(500).json({ message: 'Failed to update school', error: error.message });
    }
});

// Delete a school
router.delete('/schools/:id', async (req, res) => {
    try {
        // Ensure the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Only admins can delete schools.' });
        }

        const deletedSchool = await School.findByIdAndDelete(req.params.id);

        if (!deletedSchool) {
            return res.status(404).json({ msg: 'School not found' });
        }

        res.status(200).json({ message: 'School deleted successfully' });
    } catch (error) {
        console.error(`Error deleting school: ${error.message}`);
        res.status(500).json({ message: 'Failed to delete school', error: error.message });
    }
});

module.exports = router;
