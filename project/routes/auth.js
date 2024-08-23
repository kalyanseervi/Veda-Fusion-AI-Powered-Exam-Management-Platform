const express = require('express');
const { User, Role } = require('../models/User');
const Teacher = require('../models/Teacher'); // Adjust the path as needed
const School = require('../models/School');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const transporter = require('../config/nodemailer');
const logger = require('../config/logger');
const {decodeTokenFromParams} =require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h';

const sendVerificationEmail = async (user, token) => {
    const verificationUrl = `http://localhost:4200/verify/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking the following link: ${verificationUrl}`
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Verification email sent to ${user.email} successfully.`);
    } catch (err) {
        logger.error(`Failed to send verification email to ${user.email}: ${err.message}`);
        throw new Error('Could not send verification email. Please try again later.');
    }
};

router.post('/register', async (req, res) => {
    const {
        name,
        email, 
        instituteName,
        instituteAddress,
        institutephoneNumber,
        department,
        password,
        confirmpassword
    } = req.body;

    // Check if all required fields are present
    if (!name || !email  || !instituteName || !instituteAddress || !institutephoneNumber || !department || !password || !confirmpassword) {
        return res.status(400).json({ msg: 'Please fill all the required fields.' });
    }


    // Check if password and confirmPassword match
    if (password !== confirmpassword) {
        return res.status(400).json({ msg: 'Passwords do not match.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Find the school record, create if it doesn't exist
        let schoolRecord = await School.findOne({ name: instituteName });
        if (!schoolRecord) {
            schoolRecord = new School({
                name: instituteName,
                address: instituteAddress,
                phone: institutephoneNumber,
            });
            await schoolRecord.save();
        }

        let userRole = await Role.findOne({ name: 'admin' });
        if (!userRole) {
            return res.status(400).json({ msg: 'Role does not exist' });
        }

        user = new User({
            name,
            email,
            school: schoolRecord._id,
            instituteAddress,
            institutephoneNumber,
            department,
            password,
            role: userRole._id
        });

        const token = user.createEmailVerificationToken();
        await user.save();

        await sendVerificationEmail(user, token);

        res.status(201).json({ msg: 'User registered successfully. Verification email sent.' });
    } catch (err) {
        logger.error(`Registration error for ${email}: ${err.message}`);
        res.status(500).json({ msg: 'An error occurred during registration. Please try again later.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists as a regular user
        let user = await User.findOne({ email }).populate('role').populate('school').exec();

        // If not found as a user, check if it's a teacher
        if (!user) {
            user = await Teacher.findOne({ email }).populate('role').populate('school').exec();
            if (!user) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }
            console.log(user)
        }

        if (!user.emailVerified) {
            return res.status(400).json({ msg: 'Email not verified' });
        }

        // Check password match (assume `matchPassword` is a method available in both User and Teacher models)
        const isMatch = await user.matchPassword(password);
        console.log('yes', isMatch)
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        console.log("my data is here", user);

        const payload = { userEmail: user.email, userRole: user.role.name, userName:user.name, school: user.school._id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({ msg: 'Login successful', token });
    } catch (err) {
        logger.error(`Login error for ${email}: ${err.message}`);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.get('/verify/:token', async (req, res) => {
    try {
        // Create the hashed token from the request parameter
        const emailVerificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Check for a user with the verification token
        let user = await User.findOne({
            emailVerificationToken,
            emailVerificationTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            // Check for a teacher with the verification token
            user = await Teacher.findOne({
                emailVerificationToken,
                emailVerificationTokenExpiry: { $gt: Date.now() }
            });
        }

        if (!user) {
            return res.status(400).json({ msg: 'Token is invalid or has expired' });
        }

        // Verify the email and clear the token fields
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ msg: 'Email verified successfully' });
    } catch (err) {
        logger.error(`Email verification error: ${err.message}`);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ msg: 'Email is already verified' });
        }

        const token = user.createEmailVerificationToken();
        await user.save();

        await sendVerificationEmail(user, token);

        res.status(200).json({ msg: 'Verification token resent' });
    } catch (err) {
        logger.error(`Resend verification error for ${req.body.email}: ${err.message}`);
        res.status(500).json({ msg: 'Server error' });
    }
});
router.get('/userDecodeDetail/:token', decodeTokenFromParams, async (req, res) => {
    try {
        const user = req.user;
        console.log(user);
        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
