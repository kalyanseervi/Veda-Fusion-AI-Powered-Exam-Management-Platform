const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const Exam = require("../models/Exam"); // Adjust the path as necessary
const { decodeTokenFromParams, auth } = require("../middleware/auth"); // Adjust the path as necessary
const multer = require('multer'); 
const upload = multer(); 

// Validation rules
const examValidationRules = () => [
  body("examName")
    .isString()
    .withMessage("Exam name must be a string")
    .notEmpty(),
  body("examDate")
    .isISO8601()
    .withMessage("Exam date must be a valid date")
    .toDate(),
  body("examTime")
    .isString()
    .withMessage("Exam time must be a string")
    .notEmpty(),
  body("examDuration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer"),
  body("examDescription")
    .isString()
    .withMessage("Description must be a string")
    .notEmpty(),
  body("examStatus")
    .isIn(["Ongoing", "Cancelled", "On Hold", "Completed"])
    .withMessage("Invalid exam status"),
  body("difficultyLevel")
    .isIn(["easy", "medium", "hard"])
    .withMessage("Invalid difficulty level"),
  body("negativeMarking")
    .isBoolean()
    .withMessage("Negative marking must be a boolean"),
  body("negativeMarks")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Negative marks must be a positive number"),
  body("examType")
    .isIn(["multiple choice", "subjective", "both"])
    .withMessage("Invalid exam type"),
  body("screenCaptureInterval")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capture interval must be a positive integer"),
  body("captureScreenDuringExam")
    .isBoolean()
    .withMessage("Capture screen during exam must be a boolean"),
  body("createdBy").isMongoId().withMessage("Invalid teacher ID"),
];

// Middleware to validate request data
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create a new exam
router.post("/create",[auth,validate,...examValidationRules()],upload.none(),async (req, res) => {
    try {
      
        const { examName, examDate, examTime, examDuration, examDescription, difficultyLevel, negativeMarking, negativeMarks, examType, captureScreenDuringExam, screenCaptureInterval } = req.body;
        // Validate input
    
        if (!examName || !examDate || !examTime || !examDuration || !examDescription || !difficultyLevel || !examType ) {
          return res.status(400).json({ message: 'Please provide all required fields.' });
        }
        
        // Create new exam
        const newExam = new Exam({
          examName,
          examDate,
          examTime,
          examDuration,
          examStatus:'Incoming',
          examDescription,
          difficultyLevel,
          negativeMarking,
          negativeMarks: negativeMarking === 'true' ? negativeMarks : null,
          examType,
          captureScreenDuringExam,
          screenCaptureInterval: captureScreenDuringExam === 'true' ? screenCaptureInterval : null,
          createdBy:req.user._id,
        });
    
        const savedExam = await newExam.save();
        res.status(201).json(savedExam);
      } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Failed to create exam. Please try again.' });
      }
    });
// Get all exams
router.get("/exams", auth, async (req, res) => {
    try {
      // Extract the user ID or email from the request
      const userId = req.user._id; // Adjust if using email or another identifier
  
      // Find exams created by the current user
      const exams = await Exam.find({ createdBy: userId }).populate("createdBy");
  
      res.status(200).json(exams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  });

// Get a single exam by ID
router.get("/exams/:id", auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("createdBy");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.status(200).json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Update an exam
router.put(
  "/exams/:id",
  [auth, ...examValidationRules(), validate],
  async (req, res) => {
    try {
      const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.status(200).json(exam);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// Delete an exam
router.delete("/exams/:id", auth, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
