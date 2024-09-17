const mongoose = require('mongoose');

const quesResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // Reference to the User model, assuming you have one
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam', // Reference to the Exam model, assuming you have one
    required: true
  },
  responses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamQuestions', // Reference to the Question model, assuming you have one
      required: true
    },
    selectedOption: {
      type: String,
      required: false
    },
  }]
});

const QuesResponse = mongoose.model('QuesResponse', quesResponseSchema);

module.exports = QuesResponse;
