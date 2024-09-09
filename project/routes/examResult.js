const express = require("express");
const axios = require("axios"); // For making HTTP requests
const router = express.Router();
const Exam = require("../models/Exam"); // Adjust the path as necessary
const QuesResponse = require("../models/Ques_response");
const ExamQuestions = require("../models/ExamQuestion");
const { auth } = require("../middleware/auth"); // Adjust the path as necessary

const pyUrl = 'http://localhost:8000/api/questions/evaluate/'; // Gemini API URL

// Function to validate answers using Gemini API or direct comparison
const validateAnswer = async (question, userAnswer) => {
  if (question.type === 'mcq') {
    return { isCorrect: userAnswer === question.answer };
  } else if (
    question.type === 'short_answer' || 
    question.type === 'long_answer' || 
    question.type === 'short' || 
    question.type === 'long'
  ) {
    try {
      const response = await axios.post(pyUrl, {
        question: question.title,
        answer: userAnswer,
        max_marks: question.marks
      });

      return response.data; // Assuming API returns an object {isCorrect, marks}
    } catch (error) {
      console.error('Error validating answer with Gemini API:', error.message);
      throw new Error('Error validating answer.');
    }
  }
  return { isCorrect: false };
};

router.get("/studentResponse/:id", auth, async (req, res) => {
  try {
    const examId = req.params.id;

    // Fetch exam responses for the specific exam and populate user and exam details
    const examResponses = await QuesResponse.find({ examId: examId })
      .populate("userId", "name email") // Populate user's name and email
      .populate("examId");

    // Fetch exam details to check for negative marking
    const examDtl = await Exam.findById(examId);

    if (!examDtl) {
      return res.status(404).json({ msg: "Exam not found!" });
    }

    // Check if negative marking is enabled and retrieve the negative mark value
    const negativeMarking = examDtl.negativeMarking;
    const negativeMarks = negativeMarking ? examDtl.negativeMarks : 0;

    if (!examResponses || examResponses.length === 0) {
      return res.status(404).json({ msg: "No response found!" });
    }

    // Fetch exam questions for the exam
    const exam = await ExamQuestions.findOne({ examId: examId }).populate("questions");

    if (!exam || !exam.questions) {
      throw new Error("Exam or Questions not found.");
    }

    // Create a map for quick access to questions
    const questionsMap = new Map(
      exam.questions.map((q) => [q._id.toString(), q])
    );

    // Calculate total number of questions
    const totalQuestions = exam.questions.length;

    let resultsByUser = [];

    // Loop through each user's response and calculate their marks
    for (const document of examResponses) {
      let totalMarks = 0;
      let obtainedMarks = 0;
      let attemptedQuestions = 0; // Initialize attempted questions counter

      // Loop through each question response
      for (const response of document.responses) {
        const questionIdString = response.questionId.toString();
        const question = questionsMap.get(questionIdString);

        if (question) {
          totalMarks += question.marks;
          
          // Check if the student has attempted the question (response.selectedOption exists)
          if (response.selectedOption) {
            attemptedQuestions++; // Increment attempted questions count
          }

          // Validate answer based on question type
          const { isCorrect, marks } = await validateAnswer(question, response.selectedOption);
          
          if (isCorrect) {
            obtainedMarks += marks || question.marks; // Correct answer
          } else if (negativeMarking) {
            obtainedMarks -= negativeMarks; // Incorrect answer, apply negative marking
          }
        }
      }

      // Calculate the percentage
      const percentage =
        totalMarks > 0
          ? ((obtainedMarks / totalMarks) * 100).toFixed(2)
          : "0.00";

      // Push the result for the current user
      resultsByUser.push({
        user: {
          id: document.userId._id,
          name: document.userId.name,
          email: document.userId.email,
        },
        result: {
          totalQuestions,         // Total number of questions in the exam
          attemptedQuestions,     // Number of questions attempted by the user
          totalMarks,             // Total possible marks
          obtainedMarks,          // Marks obtained by the user
          percentage: parseFloat(percentage), // Percentage
        },
      });
    }

    // Sort the users based on their obtained marks in descending order (for ranking)
    resultsByUser.sort(
      (a, b) => b.result.obtainedMarks - a.result.obtainedMarks
    );

    // Assign ranking based on the sorted results
    resultsByUser = resultsByUser.map((userResult, index) => ({
      ...userResult,
      rank: index + 1, // Rank starts from 1
    }));

    // Return the results by user
    res.status(200).json({ results: resultsByUser });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
