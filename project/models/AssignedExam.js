const mongoose = require("mongoose");

const assignedExamSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam", // Ensure consistent reference to the Exam model
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // Reference to Student model (corrected)
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher", // Assuming this references a teacher or admin
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now // Automatically set current date and time
  },
  completedAt: {
    type: Date // Will be set when the exam is completed
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending' // Initial status is pending
  }
});

// Method to mark an exam as completed
assignedExamSchema.methods.markCompleted = async function () {
  try {
    this.status = 'completed';
    this.completedAt = new Date(); // Set the completion timestamp to now
    await this.save(); // Save the changes
    return this;
  } catch (error) {
    throw new Error("Error marking exam as completed: " + error.message);
  }
};

const AssignedExam = mongoose.model('AssignedExam', assignedExamSchema);

module.exports = AssignedExam;
