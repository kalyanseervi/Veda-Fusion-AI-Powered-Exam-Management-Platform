const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    // subjectCode: { type: String, required: true, unique: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    // description: { type: String }, // Optional description of the subject
    // academicYear: { type: String, required: true }, // Academic year during which the subject is taught
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Subject', SubjectSchema);
