const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema(
  {
    examName: { type: String, required: true },
    examDate: { type: Date, required: true }, // Use Date type to store both date and time
    examTime: { type: String, required: true }, // Ensure consistent time format
    examDuration: { type: Number, required: true }, // Duration in minutes
    examDescription: { type: String, required: true },
    examStatus: { 
        type: String, 
        required: true, 
        enum: ['Ongoing', 'Cancelled', 'On Hold', 'Completed','Incoming'] // Define Exam status
    },
    difficultyLevel: { 
      type: String, 
      required: true, 
      enum: ['easy', 'medium', 'hard'] // Define difficulty levels
    },
    negativeMarking: { 
      type: Boolean, 
      required: true 
    },
    negativeMarks: { 
      type: Number,
      required: function () {
        return this.negativeMarking;
      } // Only required if negativeMarking is true
    },
    examType: { 
      type: String, 
      required: true, 
      enum: ["multiple choice", "subjective", "both"] // Restrict to these values
    },
    screenCaptureInterval: { 
      type: Number,
      required: function () {
        return this.captureScreenDuringExam; // Required if screen capture is enabled
      } 
    },
    captureScreenDuringExam: { 
      type: Boolean, 
      default: false 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Teacher", 
      required: true 
    },
  },
  {
    timestamps: true // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Exam", ExamSchema);
