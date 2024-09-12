const express = require("express");
const axios = require("axios");
const router = express.Router();
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const QuesResponse = require("../models/Ques_response");
const ExamQuestions = require("../models/ExamQuestion");
const { auth } = require("../middleware/auth");
const Student = require("../models/Student");
const exceljs = require('exceljs'); // Import exceljs

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
    console.log("result examID", examId);

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
      },
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/listOfResults", auth, async (req, res) => {
  try {
    // Fetch published exam results
    const examResults = await Result.find({ published: true }).populate({
      path: "examId", // Path to the field you want to populate
      select: "examName", // Only include the examName field from the Exam model
    });

    // Prepare an array to hold results with user details
    const resultsWithUserDetails = [];

    for (const examResult of examResults) {
      // Extract user IDs from userResults
      const userIds = examResult.userResults.map((result) => result.user);

      // Fetch user details
      const users = await Student.find(
        { _id: { $in: userIds } },
        "name enrollmentId studentClass studentsubjects"
      )
        .populate({ path: "studentClass", select: "classname" })
        .populate({ path: "studentsubjects", select: "subjectName" });

      // Create a map of user details
      const userMap = new Map(users.map((user) => [user._id.toString(), user]));

      // Append user details to each user result
      const userResultsWithDetails = examResult.userResults.map((result) => {
        const user = userMap.get(result.user.toString());

        return {
          date: result.date,
          user: user, // Add user details
          percentage: result.percentage,
          rank: result.rank,
          
          // Exclude percentage and rank
        };
      });

      resultsWithUserDetails.push({
        examId: examResult.examId,
        published: examResult.published,
        userResults: userResultsWithDetails,
      });
    }

    res.status(200).json({ examResults: resultsWithUserDetails });
  } catch (err) {
    console.error("Error in getting results:", err);
    res.status(500).json({ msg: "Error fetching results" });
  }
});


router.get('/results/download/:examId', async (req, res) => {
  try {
    const { examId } = req.params;

    // Fetch the published exam results
    const examResult = await Result.findOne({ examId: examId, published: true });
    if (!examResult) {
      return res.status(404).json({ msg: "Results not found or not published." });
    }

    // Extract user IDs from userResults
    const userIds = examResult.userResults.map(result => result.user);

    // Fetch user details
    const users = await Student.find({ _id: { $in: userIds } }, "name enrollmentId");

    // Create a map of user details
    const userMap = new Map(users.map(user => [user._id.toString(), user]));

    // Prepare user results with details
    const userResultsWithDetails = examResult.userResults.map(result => {
      const user = userMap.get(result.user.toString());
      return {
        name: user ? user.name : 'Unknown',
        enrollmentId: user ? user.enrollmentId : 'Unknown',
        percentage: result.percentage,
        rank: result.rank,
      };
    });

    // Create an Excel workbook and worksheet
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Results');

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Enrollment ID', key: 'enrollmentId', width: 20 },
      { header: 'Percentage', key: 'percentage', width: 15 },
      { header: 'Rank', key: 'rank', width: 10 },
    ];

    // Add rows to the worksheet
    userResultsWithDetails.forEach(userResult => {
      worksheet.addRow(userResult);
    });

    // Set response headers and send the file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=results.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error in downloading results:", err);
    res.status(500).json({ msg: "Error downloading results" });
  }
});

module.exports = router;
