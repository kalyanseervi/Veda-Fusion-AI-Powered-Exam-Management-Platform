const express = require("express");
const { User, Role } = require("../models/User");
const Teacher = require("../models/Teacher"); // Adjust the path as needed
const School = require("../models/School");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const transporter = require("../config/nodemailer");
const logger = require("../config/logger");
const { auth, decodeTokenFromParams } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "4h";

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `http://localhost:4200/verify/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Email Verification",
    text: `Please verify your email by clicking the following link: ${verificationUrl}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${user.email} successfully.`);
  } catch (err) {
    logger.error(
      `Failed to send verification email to ${user.email}: ${err.message}`
    );
    throw new Error(
      "Could not send verification email. Please try again later."
    );
  }
};

router.post("/register", async (req, res) => {
  const {
    name,
    email,
    instituteName,
    instituteAddress,
    institutephoneNumber,

    password,
    confirmpassword,
  } = req.body;

  // Check if all required fields are present
  if (
    !name ||
    !email ||
    !instituteName ||
    !instituteAddress ||
    !institutephoneNumber ||
    !password ||
    !confirmpassword
  ) {
    return res
      .status(400)
      .json({ msg: "Please fill all the required fields." });
  }

  // Check if password and confirmPassword match
  if (password !== confirmpassword) {
    return res.status(400).json({ msg: "Passwords do not match." });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
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

    let userRole = await Role.findOne({ name: "admin" });
    if (!userRole) {
      return res.status(400).json({ msg: "Role does not exist" });
    }

    user = new User({
      name,
      email,
      school: schoolRecord._id,
      instituteAddress,
      institutephoneNumber,
      password,
      role: userRole._id,
    });

    const token = user.createEmailVerificationToken();
    await user.save();

    await sendVerificationEmail(user, token);

    res
      .status(201)
      .json({ msg: "User registered successfully. Verification email sent." });
  } catch (err) {
    logger.error(`Registration error for ${email}: ${err.message}`);
    res.status(500).json({
      msg: "An error occurred during registration. Please try again later.",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user;

    // Check if the user exists in the User collection
    user = await User.findOne({ email })
      .populate("role")
      .populate("school")
      .exec();

    // If not found in User, check in Teacher collection
    if (!user) {
      user = await Teacher.findOne({ email })
        .populate("role")
        .populate("school")
        .exec();
    }

    // If not found in Teacher, check in Student collection
    if (!user) {
      user = await Student.findOne({ email })
        .populate("role")
        .populate("school")
        .exec();
    }

    // If user is still not found, return an error
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Check if the email is verified
    if (!user.emailVerified) {
      return res.status(400).json({ msg: "Email not verified" });
    }

    // Check password match

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Prepare the payload and generate JWT
    const payload = {
      userEmail: user.email,
      userRole: user.role.name,
      userName: user.name,
      school: user.school._id,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({ msg: "Login successful", token });
  } catch (err) {
    logger.error(`Login error for ${email}: ${err.message}`);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    // Create the hashed token from the request parameter
    const emailVerificationToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Check for a user with the verification token
    let user = await User.findOne({
      emailVerificationToken,
      emailVerificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      // Check for a teacher with the verification token
      user = await Teacher.findOne({
        emailVerificationToken,
        emailVerificationTokenExpiry: { $gt: Date.now() },
      });
    }
    if (!user) {
      user = await Student.findOne({
        emailVerificationToken,
        emailVerificationTokenExpiry: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).json({ msg: "Token is invalid or has expired" });
    }

    // Verify the email and clear the token fields
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (err) {
    logger.error(`Email verification error: ${err.message}`);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ msg: "Email is already verified" });
    }

    const token = user.createEmailVerificationToken();
    await user.save();

    await sendVerificationEmail(user, token);

    res.status(200).json({ msg: "Verification token resent" });
  } catch (err) {
    logger.error(
      `Resend verification error for ${req.body.email}: ${err.message}`
    );
    res.status(500).json({ msg: "Server error" });
  }
});
router.get(
  "/userDecodeDetail/:token",
  decodeTokenFromParams,
  async (req, res) => {
    try {
      const user = req.user;

      res.status(200).json({ success: true, user });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

router.post("/update-password", auth, async (req, res) => {
  const email = req.user.email;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  console.log(req.body);
  console.log(email);

  // Check if all required fields are present
  if (!email || !currentPassword || !newPassword || !confirmPassword) {
    return res
      .status(400)
      .json({ msg: "Please fill all the required fields." });
  }

  // Check if new password and confirm password match
  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ msg: "New password and confirm password do not match." });
  }

  try {
    let user;

    // Try finding the user in User, Teacher, and Student collections
    user = await User.findOne({ email });
    if (!user) {
      user = await Teacher.findOne({ email });
    }
    if (!user) {
      user = await Student.findOne({ email });
    }

    // If the user is not found
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Check if the current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Update the password with the new password
    await user.updatePassword(currentPassword, newPassword);

    // Send response back to client
    res.status(200).json({ msg: "Password updated successfully" });
  } catch (err) {
    logger.error(`Password update error for ${email}: ${err.message}`);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST: /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    let user;

    // Try finding the user in User, Teacher, and Student collections
    user = await User.findOne({ email });
    if (!user) {
      user = await Teacher.findOne({ email });
    }
    if (!user) {
      user = await Student.findOne({ email });
    }

    // If the user is not found
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Generate reset password token
    const resetToken = user.createResetPasswordToken();
    await user.save();

    // Send email with the reset token link
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click this link to reset your password: \n\n${resetUrl}`;

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Email Verification",
        text: message,
      };
      await transporter.sendMail(mailOptions);
      res
        .status(200)
        .json({ message: "Reset password email sent successfully" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiry = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST: /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    // Find user by reset token and ensure token has not expired
    let user;

    // Try finding the user in User, Teacher, and Student collections
    user = await User.findOne({
      resetPasswordToken,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      user = await Teacher.findOne({
        resetPasswordToken,
        resetPasswordTokenExpiry: { $gt: Date.now() },
      });
    }
    if (!user) {
      user = await Student.findOne({
        resetPasswordToken,
        resetPasswordTokenExpiry: { $gt: Date.now() },
      });
    }

    // If the user is not found
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    // Set the new password
    const { password } = req.body;

    user.password = password;

    // Clear reset password token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/getUserDtl", auth, async (req, res) => {
  console.log("i am here ");
  try {
    const email = req.user.email
    console.log(email)
    const user = await User.find({email:email},"name email");
    console.log("hello", user);
    if (!user) {
      user = await Teacher.findOne({ email });
    }
    if (!user) {
      user = await Student.findOne({ email });
    }
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
