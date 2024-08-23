const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    enrollmentId: { type: String, required: true, unique: true }, // Ensure unique enrollment ID
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
    dob: { type: Date, required: true }, // Use Date type for date of birth
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    photo: { type: Buffer }, 
    studentClass: { type: String, required: true },
    studentsubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Reference to Subject model
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    password:{type:String,required:true},
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});



StudentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

StudentSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

StudentSchema.methods.createEmailVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationTokenExpiry = Date.now() + 3600000; // 1 hour
    return token;
};

module.exports = mongoose.model('Student', StudentSchema);
