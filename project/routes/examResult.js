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
const moment = require('moment'); // Import moment.js for date manipulation

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

    // Fetch exam responses and populate userId and examId
    const examResponses = await QuesResponse.find({ examId: examId })
      .populate("userId", "name email enrollmentId")
      .populate("examId");

    // Fetch the exam details including questions
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
    const exam = await ExamQuestions.findOne({ examId: examId });
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
        school:req.user.school,
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
          userResponses: document.responses.map(response => ({
            ...response._doc,
            question: questionsMap.get(response.questionId.toString()) // Map the questionId to the actual question
          }))
        });
        continue; // Skip to the next user
      }

      // Otherwise, proceed with validation
      let totalMarks = 0;
      let obtainedMarks = 0;
      let attemptedQuestions = 0;

      questionsMap.forEach((question) => {
        // Assuming the question contains a "marks" property
        totalMarks += question.marks;
      });
      
      

      const userResponses = await Promise.all(
        document.responses.map(async (response) => {
          const question = questionsMap.get(response.questionId.toString());
          if (question) {
            

            if (response.selectedOption) {
              attemptedQuestions++;
            }

            // Await the result of validateAnswer since it's an async function
            const { awardedMarks,isCorrect } = await validateAnswer(question, response.selectedOption);


            obtainedMarks += awardedMarks;

            if (negativeMarking && !isCorrect && attemptedQuestions) {
              obtainedMarks -= negativeMarks;
            }
          }
          return {
            ...response._doc, // Keep other response fields
            question // Add the full question details to the response
          };
        })
      );

      const percentage = totalMarks > 0
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
        userResponses // Include populated user responses with question details
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

    // Prepare the final response by adding userResponses in sorted order
    resultsByUser = examResult.userResults.map(userResult => ({
      user: {
        id: userResult.user,
        name: resultsByUser.find(u => u.user.id.toString() === userResult.user.toString()).user.name,
        email: resultsByUser.find(u => u.user.id.toString() === userResult.user.toString()).user.email,
        enrollmentId: resultsByUser.find(u => u.user.id.toString() === userResult.user.toString()).user.enrollmentId,
      },
      result: {
        totalQuestions: userResult.totalQuestions,
        attemptedQuestions: userResult.attemptedQuestions,
        totalMarks: userResult.totalMarks,
        obtainedMarks: userResult.obtainedMarks,
        percentage: userResult.percentage,
        rank: userResult.rank,
      },
      userResponses: resultsByUser.find(u => u.user.id.toString() === userResult.user.toString()).userResponses
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
    const examResult = await Result.findOne({ examId: examId }) .populate({
      path: "examId",
      select:'examName',
      populate: {
        path: "subject",
        model: "Subject", // Optional: If you want to specify the model for `subject`
        select:'subjectName'
      },
    });

    // console.log('examResult',examResult.examId.examName)
    // console.log('examResult subject',examResult.examId.subject.subjectName)
    const examName = examResult.examId.examName;
    const subjectName = examResult.examId.subject.subjectName;

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
        examName:examName,
        subjectName:subjectName,
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
    // Calculate the date for 24 hours ago
    const last24Hours = moment().subtract(24, 'hours').toDate();

    // Fetch published exam results within the last 24 hours
    const examResults = await Result.find({
      published: true,
      publishedDate: { $gte: last24Hours }, // Only results published in the last 24 hours
      school:req.user.school,
    }).populate({
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

router.get('/examData', auth, async (req, res) => {
  try {
    const studentId = req.user.id; // Assuming the student ID is available in req.user.id

    // Fetch student's previous exams and results
    const student = await Student.findById(studentId).populate('studentsubjects');
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    const subjects = student.studentsubjects.map(subject => subject.subjectName);

    // Fetch results for the student's subjects
    const results = await Result.find({
      'userResults.user': studentId,
      published: true
    }).populate('examId', 'examName');

    const formattedResults = results.map(result => ({
      examName: result.examId.examName,
      userResults: result.userResults.find(userResult => userResult.user.toString() === studentId.toString())
    }));

    res.status(200).json({ results: formattedResults });
  } catch (err) {
    console.error("Error fetching exam data:", err);
    res.status(500).json({ msg: "Error fetching exam data" });
  }
});

module.exports = router;
