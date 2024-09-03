const express = require("express");
const ExamQuestions = require("./../models/ExamQuestion"); // Assuming you saved the schema in `models/ExamQuestions.js`
const {auth} = require("./../middleware/auth"); // Assuming you saved the auth const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

// Create or update an ExamQuestions document
router.post("/exam-questions", auth, async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // Authorization check (e.g., only allow teachers/admins to create questions)
      if (
        !req.user ||
        !req.user.role ||
        !["teacher", "admin"].includes(req.user.role.name)
      ) {
        return res.status(403).json({ msg: "Unauthorized" });
      }
  
      console.log(req.body);
  
      // Prepare the questions data
      const newQuestions = req.body.questions.map((question) => ({
        type: question.type,
        title: question.title,
        marks: question.marks,
        wordLimit: question.wordLimit,
        answer: question.answer,
        options: question.options,
        imageUrl: question.imageUrl,
      }));
  
      // Find the existing document by examId
      let examQuestion = await ExamQuestions.findOne({ examId: req.body.examId });
  
      if (examQuestion) {
        // Merge new questions with existing ones
        examQuestion.questions = [...examQuestion.questions, ...newQuestions];
        examQuestion = await examQuestion.save();
        res.status(200).json(examQuestion);
      } else {
        // Create a new document if none exists
        examQuestion = new ExamQuestions({
          examId: req.body.examId,
          questions: newQuestions,
        });
        await examQuestion.save();
        res.status(201).json(examQuestion);
      }
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  });

// Get all ExamQuestions documents with pagination, filtering, and sorting
router.get("/exam-questions", auth, async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        examId,
        type,
        sortBy,
        order = "asc",
      } = req.query;
  
      // Construct the query object
      const query = {};
  
      // Add filtering by examId if provided
      if (examId) {
        query.examId = examId;
      }
  
      // Add filtering by question type if provided
      if (type) {
        query["questions.type"] = type;
      }
  
      // Determine sorting order
      const sortOrder = order === "desc" ? -1 : 1;
      const sortOptions = {};
  
      // Sorting logic based on query parameters
      if (sortBy) {
        sortOptions[`questions.${sortBy}`] = sortOrder;
      } else {
        // Default sorting by createdAt if no sortBy provided
        sortOptions["createdAt"] = sortOrder;
      }
  
      // Calculate total count before pagination
      const total = await ExamQuestions.countDocuments(query);
  
      // Fetch data with pagination, filtering, and sorting
      const examQuestions = await ExamQuestions.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .exec(); // Ensure execution of the query
  
      res.status(200).json({
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        data: examQuestions,
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });
  

// Get a single ExamQuestions document by ID
router.get("/exam-questions/:id", auth, async (req, res) => {
  try {
    const examQuestion = await ExamQuestions.findById(req.params.id);
    if (!examQuestion) {
      return res.status(404).json({ msg: "Exam question not found" });
    }
    res.status(200).json(examQuestion);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
// Update an existing ExamQuestions document by ID
router.put("/exam-questions/:id", auth, async (req, res) => {
    try {
      // Retrieve the existing document
      const examQuestion = await ExamQuestions.findById(req.params.id);
  
      if (!examQuestion) {
        return res.status(404).json({ msg: "Exam question not found" });
      }
  
      // Merge the updates with the existing document
      // You can selectively update fields or handle nested updates here
      const updatedFields = req.body;
  
      // Ensure only allowed fields are updated
      Object.keys(updatedFields).forEach((key) => {
        if (key !== "examId" && key !== "questions") {
          examQuestion[key] = updatedFields[key];
        }
      });
  
      // Handle updates for nested fields (e.g., questions)
      if (updatedFields.questions) {
        examQuestion.questions = updatedFields.questions;
      }
  
      // Validate and save the updated document
      await examQuestion.save();
      res.status(200).json(examQuestion);
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  });

// Delete an existing ExamQuestions document by ID
router.delete("/exam-questions/:id", auth, async (req, res) => {
    try {
      // Attempt to delete the document by ID
      const examQuestion = await ExamQuestions.findByIdAndDelete(req.params.id);
  
      // Check if the document was found and deleted
      if (!examQuestion) {
        return res.status(404).json({ msg: "Exam question not found" });
      }
  
      // Return success message if the document was deleted
      res.status(200).json({ msg: "Exam question deleted successfully" });
    } catch (err) {
      // Return an error message if something goes wrong
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  });
  

module.exports = router;
