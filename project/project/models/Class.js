const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    classname: { type: String, required: true },
    section: { type: String }, // Optional description of the class
    // academicYear: { type: String, required: true }, // Academic year for the class (e.g., "2024-2025")
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Class', ClassSchema);
