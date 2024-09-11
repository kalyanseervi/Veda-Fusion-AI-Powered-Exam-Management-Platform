const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// Create a new subject
router.post('/subjects', async (req, res) => {
  try {
    const newSubject = new Subject({
        subjectName: req.body.subjectName,
        
        classId: req.body.classId,
        
    });
  

    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all subjects
router.get('/subjects', async (req, res) => {
    try {
      const subjects = await Subject.find().populate('classId');
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Get a single subject by ID
router.get('/subjects/:id', async (req, res) => {
    try {
      const subject = await Subject.findById(req.params.id).populate('classId');
      if (!subject) return res.status(404).json({ message: 'Subject not found' });
      res.status(200).json(subject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  
// Update a subject by ID
router.put('/subjects/:id', async (req, res) => {
    try {
      const updatedSubject = await Subject.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedSubject) return res.status(404).json({ message: 'Subject not found' });
      res.status(200).json(updatedSubject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  
// Delete a subject by ID
router.delete('/subjects/:id', async (req, res) => {
    try {
      const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
      if (!deletedSubject) return res.status(404).json({ message: 'Subject not found' });
      res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get('/subjects/classSubject/:classId', async (req, res) => {
    try {
        const { classId } = req.params;

        // Find subjects that belong to the specified class
        const subjects = await Subject.find({ classId: classId });

        if (!subjects || subjects.length === 0) {
            return res.status(404).json({ msg: 'No subjects found for this class' });
        }

        res.json(subjects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
  


module.exports = router;