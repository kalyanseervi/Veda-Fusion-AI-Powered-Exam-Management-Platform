const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// Create a new subject
router.post('/subjects', async (req, res) => {
  try {
    const newSubject = new Subject({
        subjectName: req.body.subjectName,
        subjectCode: req.body.subjectCode,
        classId: req.body.classId,
        description: req.body.description,
        academicYear:req.body.academicYear
    });
    console.log(newSubject)

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
  


module.exports = router;