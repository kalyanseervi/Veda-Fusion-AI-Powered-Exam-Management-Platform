const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const School = require("../models/School");
const Student = require("../models/Student");
const User = require("../models/User");
const Class = require("../models/Class");
const Result = require("../models/Result");
const { decodeTokenFromParams, auth } = require("../middleware/auth"); // Middleware to verify user
const mongoose = require("mongoose");

router.get("/admin", auth, async (req, res) => {
  res.status(200).json({ msg: "Welcome to the admin area" });
});

router.get("/teacher", auth, async (req, res) => {
  res.status(200).json({ msg: "Welcome to the teacher area" });
});

router.get("/student", auth, async (req, res) => {
  try {

    const studentId = new mongoose.Types.ObjectId(req.user._id); // Cast to ObjectId
    console.log("Student ID:", studentId); // Debug log to verify student ID



    // Count total exams
    const totalExams = await Result.countDocuments({
      "userResults.user": studentId,
    });

    // Find student and populate subjects
    const student = await Student.findById(studentId).populate("studentsubjects");

    const totalSubjects = student.studentsubjects ? student.studentsubjects.length : 0;

    // Find student results and populate exam and subject details
    const studentResults = await Result.find({
      "userResults.user": studentId,
    }).populate({
      path: "examId",
      select: "examName",
      populate: {
        path: "subject",
        model: "Subject", 
        select: "subjectName",
      },
    });

    // Filter results to include only the results for this student
    const filteredResults = studentResults.map((result) => {
      return {
        examId: result.examId,
        userResults: result.userResults.filter((userResult) => {
          return userResult.user.toString() === studentId.toString(); // Match the studentId
        }),
      };
    });

    console.log("Filtered Student Results:", filteredResults);



    // Calculate the average percentage for each subject and all subjects
    const classResults = await Result.find({}).populate({
      path: "examId",
      select: "examName",
      populate: {
        path: "subject",
        model: "Subject",
        select: "subjectName",
      },
    });

    // Group by subject and calculate the average percentage for each subject
    const subjectAverages = {};
    const allPercentages = [];

    classResults.forEach(result => {
      const subjectId = result.examId.subject._id.toString();
      const userResults = result.userResults;

      // Loop through the results to calculate total percentage per subject
      userResults.forEach(userResult => {
        const percentage = userResult.percentage;
        allPercentages.push(percentage); // Collect all percentages for total average

        if (!subjectAverages[subjectId]) {
          subjectAverages[subjectId] = {
            subjectName: result.examId.subject.subjectName,
            totalPercentage: 0,
            count: 0,
          };
        }

        subjectAverages[subjectId].totalPercentage += percentage;
        subjectAverages[subjectId].count += 1;
      });
    });

    // Calculate average percentage for each subject
    for (const subjectId in subjectAverages) {
      const subjectData = subjectAverages[subjectId];
      subjectData.averagePercentage = subjectData.totalPercentage / subjectData.count;
    }

    // Calculate the average percentage across all subjects with 2 decimal places
    const totalClassAverage = parseFloat(
      (allPercentages.reduce((acc, curr) => acc + curr, 0) / allPercentages.length).toFixed(2)
    );

    // Send response
    res.status(200).json({
      totalExams,
      totalSubjects,
      studentResults:filteredResults, // Include studentResults in the response
      subjectAverages, // Send average percentage for each subject
      totalClassAverage, // Send the overall average percentage across all subjects
      msg: "Welcome to the student area",
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ msg: "Error fetching data", error });
  }
});


module.exports = router;
