const mongoose = require("mongoose");

const assignedExamSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true // Ensure examId is always provided
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true // Ensure studentId is always provided
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true // Ensure assignedBy is always provided
    },
    assignedAt: {
        type: Date,
        default: Date.now // Automatically set the current date and time
    },
    completedAt: {
        type: Date,
        default: Date.now // Automatically set the current date and time
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending' // Initial status is pending
    }
});

const AssignedExam = mongoose.model('AssignedExam', assignedExamSchema);

module.exports = AssignedExam;
