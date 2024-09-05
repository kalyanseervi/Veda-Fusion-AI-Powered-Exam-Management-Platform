const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissions: [String] // Permissions can be managed here
});

const UserSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    department: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.createEmailVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationTokenExpiry = Date.now() + 3600000; // 1 hour
    return token;
};

module.exports = {
    User: mongoose.model('User', UserSchema),
    Role: mongoose.model('Role', RoleSchema)
};
