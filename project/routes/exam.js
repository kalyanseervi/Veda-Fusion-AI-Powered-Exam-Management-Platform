const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const Exam = require("../models/Exam"); // Adjust the path as necessary
const { decodeTokenFromParams, auth } = require("../middleware/auth"); // Adjust the path as necessary
const multer = require("multer");
const upload = multer();
const AssignedExam = require("../models/AssignedExam");
const ExamQuestions = require("../models/ExamQuestion");
const QuesResponse = require("../models/Ques_response");
const Result = require("../models/Result");

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
    .isIn(["Ongoing", "Cancelled", "On Hold", "Completed", "Incoming"])
    .withMessage("Invalid exam status"),
  body("negativeMarking")
    .isBoolean()
    .withMessage("Negative marking must be a boolean"),
  body("negativeMarks")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Negative marks must be a positive number"),
  body("screenCaptureInterval")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capture interval must be a positive integer"),
  body("captureScreenDuringExam")
    .isBoolean()
    .withMessage("Capture screen during exam must be a boolean"),
];

// Middleware to validate request data
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/// Create a new exam
router.post(
  "/create",
  [auth, validate, ...examValidationRules()],
  upload.none(),
  async (req, res) => {
    try {
      const {
        examName,
        examDate,
        examTime,
        examDuration,
        examDescription,
        negativeMarking,
        negativeMarks,
        captureScreenDuringExam,
        screenCaptureInterval,
        class: classId,
        subject: subjectId,
      } = req.body;



      // Ensure boolean values are parsed correctly
      const isNegativeMarking =
        negativeMarking === "true" || negativeMarking === true;
      const isCaptureScreen =
        captureScreenDuringExam === "true" || captureScreenDuringExam === true;

      // Validate required fields (optional but recommended)
      if (
        !examName ||
        !examDate ||
        !examTime ||
        !examDuration ||
        !classId ||
        !subjectId
      ) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      // Create new exam
      const newExam = new Exam({
        examName,
        examDate,
        examTime,
        examDuration,
        examStatus: "Incoming", // Set default status to "Incoming"
        examDescription,
        negativeMarking: isNegativeMarking,
        negativeMarks: isNegativeMarking ? negativeMarks : null, // Only set negative marks if negative marking is enabled
        captureScreenDuringExam: isCaptureScreen,
        screenCaptureInterval: isCaptureScreen ? screenCaptureInterval : null, // Only set interval if screen capture is enabled
        createdBy: req.user._id, // Use the logged-in user for createdBy
        class: classId,
        subject: subjectId,
      });

      // Save the exam to the database
      const savedExam = await newExam.save();
      res.status(201).json(savedExam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res
        .status(500)
        .json({ message: "Failed to create exam. Please try again." });
    }
  }
);

// Get all exams
router.get("/exams", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const exams = await Exam.find({ createdBy: userId }).populate(
      "createdBy class subject"
    );
    res.status(200).json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Get a single exam by ID
router.get("/exams/:id", auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate(
      "createdBy class subject"
    );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const currentTime = new Date();
    const examEndTime = new Date(exam.examEndTime);

    // Check if the exam has already ended
    let remainingTime = 0;
    let status = "Ongoing";

    if (currentTime >= examEndTime) {
      status = "Completed";
    } else {
      // Calculate the remaining time in seconds
      remainingTime = Math.floor((examEndTime - currentTime) / 1000); // Convert milliseconds to seconds
    }

    res.status(200).json({
      exam,
      remainingTime, // Time left in seconds
      status,
    });
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

// Delete an exam and related documents
router.delete("/exams/:id", auth, async (req, res) => {
  try {
    // Find the exam by its ID
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const examId = exam._id;

    // Ensure the exam and related documents are deleted in parallel
    await Promise.all([
      exam.deleteOne(), // Delete the exam itself
      AssignedExam.deleteMany({ examId }), // Delete all assigned exams
      ExamQuestions.deleteMany({ examId }), // Delete all exam questions
      QuesResponse.deleteMany({ examId }), // Delete all question responses
      Result.deleteMany({ examId }), // Delete all results
    ]);

    // Return success response
    res
      .status(200)
      .json({ message: "Exam and related documents deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam and related documents:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
