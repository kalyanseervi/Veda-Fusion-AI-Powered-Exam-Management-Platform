const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

const QuestionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  marks: {
    type: Number,
    required: true,
    min: 0, // No negative marks
  },
  wordLimit: {
    type: Number,
    min: 0,
  },
  answer: { type: String, required: true },
  options: [String],
  imageUrl: { type: String },
});

const ExamSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "An exam must have at least one question.",
      },
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
  }
);
const ExamQuestions = mongoose.model("ExamQuestions", ExamSchema);

module.exports = ExamQuestions;
