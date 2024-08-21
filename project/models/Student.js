const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    user: { type: String, required: true },
    enrollmentId: { type: String, required: true, unique: true }, // Ensure unique enrollment ID
    dob: { type: Date, required: true }, // Use Date type for date of birth
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pinCode: { type: String, required: true },
    streamClass: { type: String, required: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Reference to Subject model
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true }, // Reference to Teacher model
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Student', StudentSchema);
