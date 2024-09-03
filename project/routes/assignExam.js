const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const Exam = require("../models/Exam"); // Adjust the path as necessary
const AssignedExam = require("../models/AssignedExam");
const { decodeTokenFromParams, auth } = require("../middleware/auth"); //
const transporter = require("../config/nodemailer");

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
    console.log(err);
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
      console.log(
        "Assignments already exist for the provided exam ID and student IDs."
      );
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
        console.log(`Notification sent to student ${studentId}`);
      })
    );

    return res.status(201).json(assignedExams); // Return the assigned exams
  } catch (error) {
    return res.status(500).json({
      message: `Error assigning exam and sending notifications: ${error.message}`,
    });
  }
});

router.get("/assignedExams",auth, async (req, res) => {
  try {
    const studentId = req.user._id; // Assuming the student ID is stored in req.user._id after authentication

    // Find all assigned exams for the authenticated student
    const assignedExams = await AssignedExam.find({
      studentId: studentId,
    }).populate("examId");

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

module.exports = router;
