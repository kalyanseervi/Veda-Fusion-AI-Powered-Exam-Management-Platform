const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const School = require('../models/School');
const User = require('../models/User');
const Class = require('../models/Class');
const {decodeTokenFromParams,auth} = require('../middleware/auth'); // Middleware to verify user

// Create a new class
router.post('/classes',auth, async (req, res) => {
    try {
      const newClass = new Class({
        classname: req.body.classname,
        section: req.body.section,
        
      });
  
      await newClass.save();
      res.status(201).json(newClass);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all classes
router.get('/classes',auth, async (req, res) => {
    try {
      const classes = await Class.find();
      res.status(200).json(classes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get a single class by ID
router.get('/classes/:id',auth, async (req, res) => {
    try {
      const classItem = await Class.findById(req.params.id);
      if (!classItem) return res.status(404).json({ message: 'Class not found' });
      res.status(200).json(classItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update a class by ID
router.put('/classes/:id',auth, async (req, res) => {
    try {
      const updatedClass = await Class.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedClass) return res.status(404).json({ message: 'Class not found' });
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete a class by ID
router.delete('/classes/:id',auth, async (req, res) => {
    try {
      const deletedClass = await Class.findByIdAndDelete(req.params.id);
      if (!deletedClass) return res.status(404).json({ message: 'Class not found' });
      res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

module.exports = router;