const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // address: { type: String, required: true },
    // contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    // city: { type: String, required: true },
    // district: { type: String, required: true },
    // state: { type: String, required: true },
    // country: { type: String, required: true },
    // Reference to multiple classes
    teachingClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    // Reference to multiple subjects
    teachingSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    // qualification: { type: String, required: true },
    // experience: { type: String, required: true },
    // photo: { type: Buffer }, // Storing the photo as binary data
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who added the teacher
    password:{type:String,required:true},
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,
});

TeacherSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

TeacherSchema.methods.createEmailVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationTokenExpiry = Date.now() + 3600000; // 1 hour
    return token;
};
// Method to create/reset password token
TeacherSchema.methods.createResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    return resetToken;
};

// Method to update the password
TeacherSchema.methods.updatePassword = async function (currentPassword, newPassword) {
    // Check if current password matches
    const isMatch = await this.matchPassword(currentPassword);
    if (!isMatch) {
        throw new Error('Current password is incorrect');
    }

   
    this.password = newPassword;
    await this.save();
};

module.exports = mongoose.model('Teacher', TeacherSchema);
