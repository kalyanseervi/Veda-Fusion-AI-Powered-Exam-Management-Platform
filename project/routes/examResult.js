const express = require("express");
const axios = require("axios");
const router = express.Router();
const Exam = require("../models/Exam");
const Result = require("../models/Result")
const QuesResponse = require("../models/Ques_response");
const ExamQuestions = require("../models/ExamQuestion");
const { auth } = require("../middleware/auth");

const pyUrl = "http://localhost:8000/api/questions/evaluate/";

// Function to validate answers using Gemini API or direct comparison
const validateAnswer = async (question, userAnswer) => {
  if (question.type === "mcq") {
    return {
      isCorrect: userAnswer === question.answer,
      awardedMarks: userAnswer === question.answer ? question.marks : 0,
    };
  } else if (
    ["short_answer", "long_answer", "short", "long"].includes(question.type)
  ) {
    try {
      const response = await axios.post(pyUrl, {
        question: question.title,
        answer: userAnswer,
        max_marks: question.marks,
      });

      const { isCorrect, awardedMarks, explanation } = response.data;

      return {
        isCorrect: isCorrect === "true" || isCorrect === true,
        awardedMarks: parseFloat(awardedMarks) || 0,
        explanation: explanation,
      };
    } catch (error) {
      console.error("Error validating answer with Gemini API:", error.message);
      throw new Error("Error validating answer.");
    }
  }
  return { isCorrect: false, awardedMarks: 0 };
};

router.get("/studentResponse/:id", auth, async (req, res) => {
  try {
    const examId = req.params.id;

    // Fetch exam responses
    const examResponses = await QuesResponse.find({ examId: examId })
      .populate("userId", "name email enrollmentId")
      .populate("examId");

    const examDtl = await Exam.findById(examId);
    if (!examDtl) {
      return res.status(404).json({ msg: "Exam not found!" });
    }

    const negativeMarking = examDtl.negativeMarking;
    const negativeMarks = negativeMarking ? examDtl.negativeMarks : 0;

    if (!examResponses || examResponses.length === 0) {
      return res.status(404).json({ msg: "No response found!" });
    }

    // Fetch exam questions
    const exam = await ExamQuestions.findOne({ examId: examId }).populate(
      "questions"
    );
    if (!exam || !exam.questions) {
      throw new Error("Exam or Questions not found.");
    }

    const questionsMap = new Map(
      exam.questions.map((q) => [q._id.toString(), q])
    );

    const totalQuestions = exam.questions.length;

    let resultsByUser = [];

    // Get existing exam result (if any)
    let examResult = await Result.findOne({ examId: examId });

    if (!examResult) {
      // If no result exists for this exam, create a new one
      examResult = new Result({
        examId: examId,
        userResults: [],
      });
    }

    for (const document of examResponses) {
      // Check if the result for this user already exists
      const existingUserResult = examResult.userResults.find(
        (result) => result.user.toString() === document.userId._id.toString()
      );

      if (existingUserResult) {
        // If result exists, skip validation and use the existing result
        resultsByUser.push({
          user: {
            id: existingUserResult.user,
            name: document.userId.name,
            email: document.userId.email,
            enrollmentId: document.userId.enrollmentId,
          },
          result: {
            totalQuestions: existingUserResult.totalQuestions,
            attemptedQuestions: existingUserResult.attemptedQuestions,
            totalMarks: existingUserResult.totalMarks,
            obtainedMarks: existingUserResult.obtainedMarks,
            percentage: existingUserResult.percentage,
            rank: existingUserResult.rank,
          },
        });
        continue; // Skip to the next user
      }

      // Otherwise, proceed with validation
      let totalMarks = 0;
      let obtainedMarks = 0;
      let attemptedQuestions = 0;

      for (const response of document.responses) {
        const questionIdString = response.questionId.toString();
        const question = questionsMap.get(questionIdString);

        if (question) {
          totalMarks += question.marks;

          if (response.selectedOption) {
            attemptedQuestions++;
          }

          const { isCorrect, awardedMarks } = await validateAnswer(
            question,
            response.selectedOption
          );

          obtainedMarks += awardedMarks;

          if (negativeMarking) {
            obtainedMarks -= negativeMarks;
          }
        }
      }

      const percentage =
        totalMarks > 0
          ? ((obtainedMarks / totalMarks) * 100).toFixed(2)
          : "0.00";

      const userResult = {
        user: document.userId._id,
        totalQuestions,
        attemptedQuestions,
        totalMarks,
        obtainedMarks,
        percentage: parseFloat(percentage),
        rank: 0, // Rank will be updated after sorting
      };

      examResult.userResults.push(userResult); // Add the result for the user

      resultsByUser.push({
        user: {
          id: document.userId._id,
          name: document.userId.name,
          email: document.userId.email,
          enrollmentId: document.userId.enrollmentId,
        },
        result: {
          totalQuestions,
          attemptedQuestions,
          totalMarks,
          obtainedMarks,
          percentage: parseFloat(percentage),
        },
      });
    }

    // Sort by obtainedMarks in descending order to calculate ranks
    examResult.userResults.sort((a, b) => b.obtainedMarks - a.obtainedMarks);

    // Update ranks based on the sorted list
    examResult.userResults.forEach((userResult, index) => {
      userResult.rank = index + 1; // Rank starts from 1
    });

    // Save the updated exam result document
    await examResult.save();

    resultsByUser = examResult.userResults.map((userResult) => ({
      user: {
        id: userResult.user,
        name: resultsByUser.find((u) => u.user.id === userResult.user).user
          .name,
        email: resultsByUser.find((u) => u.user.id === userResult.user).user
          .email,
        enrollmentId: resultsByUser.find((u) => u.user.id === userResult.user)
          .user.enrollmentId,
      },
      result: {
        totalQuestions: userResult.totalQuestions,
        attemptedQuestions: userResult.attemptedQuestions,
        totalMarks: userResult.totalMarks,
        obtainedMarks: userResult.obtainedMarks,
        percentage: userResult.percentage,
        rank: userResult.rank,
      },
    }));

    res.status(200).json({ results: resultsByUser });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

router.post("/publishResult/:id", async (req, res) => {
  try {
    const examId = req.params.id;
    console.log('result examID',examId)

    // Find the exam result
    const examResult = await Result.findOne({ examId: examId });

    if (!examResult) {
      return res.status(404).json({ msg: "Exam result not found!" });
    }

    // Publish the result
    examResult.published = true;
    await examResult.save();

    res.status(200).json({ msg: "Results have been published." });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/viewResultOfStd/:id", auth, async (req, res) => {
  try {
    const examId = req.params.id;
    const userId = req.user._id; // Assuming you have user details in req.user from auth middleware

    // Fetch exam result
    const examResult = await Result.findOne({ examId: examId });

    // If result document doesn't exist, return 404
    if (!examResult) {
      return res.status(404).json({ msg: "Exam results not found!" });
    }

    // Check if the results are published
    if (!examResult.published) {
      return res.status(404).json({ msg: "Results are not published yet!" });
    }

    // Find the result for the current user
    const userResult = examResult.userResults.find(
      (result) => result.user.toString() === userId.toString()
    );

    // If user result is not found, return 404
    if (!userResult) {
      return res.status(404).json({ msg: "No result found for this user!" });
    }

    // Return the user's result
    res.status(200).json({
      user: {
        id: userResult.user,
        totalQuestions: userResult.totalQuestions,
        attemptedQuestions: userResult.attemptedQuestions,
        totalMarks: userResult.totalMarks,
        obtainedMarks: userResult.obtainedMarks,
        percentage: userResult.percentage,
        rank: userResult.rank,
      }
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ msg: err.message });
  }
});


module.exports = router;
