const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const Exam = require("../models/Exam"); // Adjust the path as necessary
const AssignedExam = require("../models/AssignedExam");
const QuesResponse = require("../models/Ques_response");
const ExamQuestions = require("../models/ExamQuestion");
const { decodeTokenFromParams, auth } = require("../middleware/auth"); //

router.get("/studentResponse/:id", auth, async (req, res) => {
  try {
    console.log(req.params.id);

    const examId = req.params.id;
    const examResponses = await QuesResponse.find({
      examId: examId,
    })
      .populate("userId")
      .populate("examId");
    if (!examResponses) {
      return res.status(404).json({ msg: "No response Found!" });
    }

    console.log(examResponses)

    // Fetch exam questions
    const exam = await ExamQuestions.find({ examId: examId }).populate(
      "questions"
    );

    if (!exam) {
      throw new Error("Exam not found.");
    }


    // const responses = examResponses.responses;
    // console.log(responses);
    let totalMarks = 0;
    let obtainedMarks = 0;

    // const questionsMap = new Map(
    //   exam.questions.map((q) => [q._id.toString(), q])
    // );
    console.log(exam)

    // // Compute result
    // responses.forEach((response) => {
    //   const question = questionsMap.get(response.questionId._id.toString());
    //   if (question) {
    //     if (question.answer === response.selectedOption) {
    //       obtainedMarks += question.marks;
    //     }
    //     totalMarks += question.marks;
    //   }
    // });
    // const result = {
    //   totalMarks,
    //   obtainedMarks,
    //   percentage: (obtainedMarks / totalMarks) * 100,
    // };
    // console.log(result);
    res.status(200).json(examResponses);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
