const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Role Schema
const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissions: [String] // Array of permissions for role-based access control
});

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    password: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }
});

// Password hashing before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare the current password
UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to create email verification token
UserSchema.methods.createEmailVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    return token;
};

// Method to create/reset password token
UserSchema.methods.createResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    return resetToken;
};

// Method to update the password
UserSchema.methods.updatePassword = async function (currentPassword, newPassword) {
    // Check if current password matches
    const isMatch = await this.matchPassword(currentPassword);
    if (!isMatch) {
        throw new Error('Current password is incorrect');
    }   
    this.password = newPassword;
    await this.save();
};

module.exports = {
    User: mongoose.model('User', UserSchema),
    Role: mongoose.model('Role', RoleSchema)
};
