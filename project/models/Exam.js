const mongoose = require("mongoose");
const moment = require("moment"); // For handling date and time

const ExamSchema = new mongoose.Schema(
  {
    examName: { type: String, required: true },
    examDate: { type: Date, required: true }, // Use Date type to store both date and time
    examTime: { type: String, required: true }, // Ensure consistent time format
    examDuration: { type: Number, required: true }, // Duration in minutes

    // Add examEndTime to store when the exam will end
    examEndTime: { type: Date },
    class: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Class", 
      required: true 
    },
    subject: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Subject", 
      required: true 
    },
    
    
    examDescription: { type: String, required: true },
    examStatus: { 
        type: String, 
        required: true, 
        enum: ['Ongoing', 'Cancelled', 'On Hold', 'Completed', 'Incoming'], // Define Exam status
        default: 'Incoming' // Default status
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

// Hook to calculate examEndTime before saving the exam
ExamSchema.pre('save', function (next) {
  // Create a moment object from examDate (Date object) and examTime (String in "HH:mm" format)
  const examStart = moment(this.examDate)
    .set({ hour: parseInt(this.examTime.split(':')[0]), minute: parseInt(this.examTime.split(':')[1]) });

  console.log('Exam Start Time:', examStart.format()); // For debugging

  // Calculate the exam end time by adding examDuration
  this.examEndTime = examStart.add(this.examDuration, 'minutes').toDate();
  
  console.log('Exam End Time:', this.examEndTime); // For debugging

  next();
});



module.exports = mongoose.model("Exam", ExamSchema);
