const moment = require("moment");
const AssignedExam = require("../models/AssignedExam"); // Adjust the path as per your project structure
const Exam = require("../models/Exam");

const examMiddleware = async (req, res, next) => {
  try {
    const userId = req.user._id; // Assuming user (student) is in req.user after authentication
    const { examId } = req.body;

    // Step 1: Verify if the student is assigned to the exam
    const assignedExam = await AssignedExam.findOne({ examId, studentId: userId });
    if (!assignedExam) {
      return res.status(404).json({ error: "Assigned exam not found for this student" });
    }

    // Step 2: Check if the exam has already been completed by the student
    if (assignedExam.status === "completed") {
      return res.status(400).json({ error: "This exam has already been completed by you" });
    }

    // Step 3: Fetch the exam details to check status and timings
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // Step 4: Check the overall exam status
    if (['Cancelled', 'Completed', 'On Hold'].includes(exam.examStatus)) {
      return res.status(400).json({ error: `The exam is currently ${exam.examStatus.toLowerCase()}.` });
    }

    // Step 5: Check if the current time is within the exam's allowed start and end time
    const currentTime = moment();

    // Calculate the exam start time using the examDate and examTime
    const examStartTime = moment(exam.examDate)
      .set({ hour: parseInt(exam.examTime.split(':')[0]), minute: parseInt(exam.examTime.split(':')[1]) });

    // Ensure the `examEndTime` is available and correctly calculated
    if (!exam.examEndTime) {
      return res.status(500).json({ error: "Exam end time is not properly set." });
    }
    const examEndTime = moment(exam.examEndTime);

    // Check if the exam start time hasn't yet arrived
    if (currentTime.isBefore(examStartTime)) {
      return res.status(400).json({ error: "The exam cannot be started before the scheduled start time." });
    }

    // Check if the exam has already ended
    if (currentTime.isAfter(examEndTime)) {
      return res.status(400).json({ error: "The exam time has already passed." });
    }

    // Step 6: If all checks pass, allow the student to start the exam
    next();
  } catch (error) {
    console.error("Error in examMiddleware:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = examMiddleware;
