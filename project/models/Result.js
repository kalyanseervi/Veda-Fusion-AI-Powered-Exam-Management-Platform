const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define a sub-schema for user-specific results
const UserResultSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Student", // Assuming there's a User model for students
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  attemptedQuestions: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  obtainedMarks: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  
});

// Main schema for storing exam results with multiple users
const ResultSchema = new Schema({
  examId: {
    type: Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  userResults: [UserResultSchema], // Array of user-specific results for an exam
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  published: {
    type: Boolean,
    default: false, // By default, the result is not published
  },
  publishedDate: {
    type: Date, // Field to track when the result was published
  },
});

// Before saving, set publishedDate if result is published
ResultSchema.pre("save", function (next) {
  if (this.published && !this.publishedDate) {
    this.publishedDate = new Date(); // Set the current date when publishing
  }
  next();
});

module.exports = mongoose.model("Result", ResultSchema);
