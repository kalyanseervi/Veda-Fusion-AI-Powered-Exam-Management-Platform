const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for individual questions
const QuestionSchema = new Schema({
  question: { type: String, required: true },
  options: { type: [String], default: [] },  // For MCQs
  answer: { type: String, required: true }
});

// Schema for question types
const QuestionTypesSchema = new Schema({
  mcq: { type: [QuestionSchema], default: [] },
  short_answer: { type: [QuestionSchema], default: [] },
  long_answer: { type: [QuestionSchema], default: [] },
  yes_no: { type: [QuestionSchema], default: [] },
  fill_in_the_blanks: { type: [QuestionSchema], default: [] }
});

// Schema for difficulty levels
const DifficultyLevelsSchema = new Schema({
  easy: { type: Number, required: true },
  medium: { type: Number, required: true },
  difficult: { type: Number, required: true }
});

// Main schema for the exam question model
const ExamQuestionSchema = new Schema({
  class: { type: String, required: true },
  subject: { type: String, required: true },
  topics: { type: String, required: true },
  pdfInput: { type: String, default: null },
  questionTypes: { type: QuestionTypesSchema, required: true },
  difficulty_levels: { type: DifficultyLevelsSchema, required: true },
  total_marks: { type: Number, required: true }
}, { timestamps: true }); // Include timestamps for created and updated times

// Export the model
module.exports = mongoose.model('ExamQuestion', ExamQuestionSchema);
