const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const School = require("../models/School");
const Student = require("../models/Student");
const User = require("../models/User");
const Class = require("../models/Class");
const Result = require("../models/Result");
const { decodeTokenFromParams, auth } = require("../middleware/auth"); // Middleware to verify user

router.get("/admin", auth, async (req, res) => {
  res.status(200).json({ msg: "Welcome to the admin area" });
});

router.get("/teacher", auth, async (req, res) => {
  res.status(200).json({ msg: "Welcome to the teacher area" });
});

router.get("/student", auth, async (req, res) => {
    try {
      console.log("i am here");
      const studentId = req.user._id;
  
      // Count total exams
      const totalExams = await Result.countDocuments({
        "userResults.user": studentId,
      });
  
      // Find student and populate subjects
      const student = await Student.findById(studentId).populate("studentsubjects");
  
      const totalSubjects = student.studentsubjects
        ? student.studentsubjects.length
        : 0;
  
      // Find student results and populate exam and subject details
      const studentResults = await Result.find({
        "userResults.user": studentId,
      }).populate({
        path: "examId",
        select: "examName",
        populate: {
          path: "subject",
          model: "Subject", // Optional: If you want to specify the model for `subject`
          select: "subjectName",
        },
      });
  
      console.log("my results", studentResults);
  
      // Send response
      res.status(200).json({
        totalExams: totalExams,
        totalSubjects: totalSubjects,
        studentResults: studentResults, // Include studentResults in the response
        msg: "Welcome to the student area",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ msg: "Error fetching data", error });
    }
  });
  

module.exports = router;
