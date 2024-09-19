const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    enrollmentId: { type: String,  unique: true }, // Ensure unique enrollment ID
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,
    // dob: { type: Date, required: true }, // Use Date type for date of birth
    // address: { type: String, required: true },
    // city: { type: String, required: true },
    // district: { type: String, required: true },
    // state: { type: String, required: true },
    // country: { type: String, required: true },
    // contactNumber:{type:String,required:true},
    // photo: { type: Buffer }, 
    studentClass: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    studentsubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Reference to Subject model
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    password:{type:String, required:true},
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Middleware to generate a unique enrollmentId
StudentSchema.pre('save', async function (next) {
    if (this.isNew) {
        const schoolId = this.school.toString().slice(-4); // Extract last 4 digits of school ID
        const year = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of the current year
        
        let enrollmentId;
        let isUnique = false;

        while (!isUnique) {
            const randomPart = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
            enrollmentId = `${schoolId}${year}${randomPart}`;

            // Check if the generated enrollmentId is unique
            const existingStudent = await mongoose.models.Student.findOne({ enrollmentId });
            if (!existingStudent) {
                isUnique = true;
            }
        }

        this.enrollmentId = enrollmentId;

        console.log(this.enrollmentId)
    }
    next();
});

// Method to compare passwords
StudentSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to create an email verification token
StudentSchema.methods.createEmailVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationTokenExpiry = Date.now() + 3600000; // 1 hour
    return token;
};

// Method to create/reset password token
StudentSchema.methods.createResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    return resetToken;
};

// Method to update the password
StudentSchema.methods.updatePassword = async function (currentPassword, newPassword) {
    // Check if current password matches
    const isMatch = await this.matchPassword(currentPassword);
    if (!isMatch) {
        throw new Error('Current password is incorrect');
    }

    // Hash the new password before saving
    this.password = await bcrypt.hash(newPassword, 10);
    await this.save();
};

module.exports = mongoose.model('Student', StudentSchema);
