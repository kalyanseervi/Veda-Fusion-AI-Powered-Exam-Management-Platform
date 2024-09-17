const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const Exam = require("../models/Exam"); // Adjust the path as necessary
const AssignedExam = require("../models/AssignedExam");
const QuesResponse = require("../models/Ques_response");
const { decodeTokenFromParams, auth } = require("../middleware/auth"); //
const transporter = require("../config/nodemailer");
const examMiddleware = require("../middleware/examMiddleware");

const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Assigning exam ",
    text: `you are invited to access exam ....... best of luck`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw new Error(
      "Could not send verification email. Please try again later."
    );
  }
};

router.post("/assignExamAndNotify", auth, async (req, res) => {
  try {
    const { examId, studentIds, email } = req.body;

    // Check if assignments already exist for the provided exam ID and student IDs
    const existingAssignments = await AssignedExam.find({
      examId: examId,
      studentId: { $in: studentIds },
    });

    if (existingAssignments.length > 0) {
      // If assignments exist, handle the scenario (e.g., update existing assignments or ignore the request)
      // For now, let's log a message and return without making any changes

      return res.status(200).json({
        message:
          "Assignments already exist for the provided exam ID and student IDs.",
      });
    }

    // If no assignments exist, proceed with creating new assignments and sending notifications
    const assignedExams = await Promise.all(
      studentIds.map(async (studentId) => {
        const assignedExam = new AssignedExam({
          examId: examId,
          studentId: studentId,
          assignedBy: req.user._id, // Assuming the authenticated user is assigning the exam
        });

        return await assignedExam.save();
      })
    );

    await Promise.all(
      studentIds.map(async (studentId) => {
        // Your logic to send notifications to each student
        // This could involve sending emails, push notifications, or any other form of communication
        const code = "assignexam";
        await sendVerificationEmail(email, code);
      })
    );

    return res.status(201).json(assignedExams); // Return the assigned exams
  } catch (error) {
    return res.status(500).json({
      message: `Error assigning exam and sending notifications: ${error.message}`,
    });
  }
});

router.get("/assignedExams", auth, async (req, res) => {
  try {
    const studentId = req.user._id; // Assuming the student ID is stored in req.user._id after authentication

    // Find all assigned exams for the authenticated student
    const assignedExams = await AssignedExam.find({
      studentId: studentId,
    })
      .populate({
        path: "examId",
        populate: {
          path: "subject",
          model: "Subject", // Optional: If you want to specify the model for `subject`
          select:'subjectName'
        },
      })
      .populate({
        path: "assignedBy",
        select: "name email",
      });

    if (!assignedExams) {
      return res.status(404).json({
        message: "No assigned exams found for the authenticated student.",
      });
    }

    // Return the list of assigned exams to the student
    return res.status(200).json({ assignedExams: assignedExams });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching assigned exams: ${error.message}` });
  }
});

router.post("/startExam", auth, examMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; // Student's ID from auth middleware
    const { examId } = req.body;

    // Fetch assigned exam
    const assignedExam = await AssignedExam.findOne({
      examId,
      studentId: userId,
    });

    if (!assignedExam) {
      return res.status(404).json({ error: "Assigned exam not found" });
    }

    // At this point, the middleware has already validated the timing and status
    res
      .status(200)
      .json({ message: "Exam can be started", examDetails: assignedExam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/quesresponseAll", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { examId, responses } = req.body;

    if (examId && userId) {
      // Create a new QuesResponse document or update the existing one
      let quesResponse = await QuesResponse.findOne({ userId, examId });

      if (!quesResponse) {
        // If no existing document found, create a new one
        quesResponse = new QuesResponse({ userId, examId, responses });
      } else {
        // If existing document found, update the responses array
        quesResponse.responses = responses;
      }

      // Save the updated document
      await quesResponse.save();
      const answeredCount = responses.filter(
        (response) => response.selectedOption
      ).length;
      const totalCount = responses.length;

      // Update the status to 'completed' if at least one question is answered
      if (answeredCount > 0) {
        await AssignedExam.findOneAndUpdate(
          { studentId: userId, examId },
          {
            status: "completed",
            completedAt: Date.now(),
          }
        );
      }

      res.status(201).send(quesResponse);
    } else {
      res.status(400).send("User ID and/or Exam ID missing from request body");
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post("/quesresponse/:quesId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const quesId = req.params.quesId;
    const { examId, responses } = req.body;
    const selectedOption = responses[0].selectedOption; // Accessing selectedOption from the first element of responses array

    if (userId && examId && quesId) {
      // Find the existing QuesResponse document or create a new one
      let quesResponse = await QuesResponse.findOne({ userId, examId });

      if (!quesResponse) {
        // If no existing document found, create a new one with the new response
        quesResponse = new QuesResponse({
          userId,
          examId,
          responses: [{ questionId: quesId, selectedOption }],
        });
      } else {
        // If existing document found, find the response for the specific question
        const existingResponse = quesResponse.responses.find(
          (response) => response.questionId.toString() === quesId
        );

        if (existingResponse) {
          // If response for the specific question already exists, update the selectedOption

          existingResponse.selectedOption = selectedOption;
        } else {
          // If response for the specific question does not exist, add a new response
          quesResponse.responses.push({ questionId: quesId, selectedOption });
        }
      }

      // Save the updated document
      await quesResponse.save();

      res.status(201).send(quesResponse);
    } else {
      res
        .status(400)
        .send(
          "User ID, Exam ID, Question ID, and/or Selected Option missing from request body"
        );
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
