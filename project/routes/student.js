const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const School = require("../models/School");
const { User, Role } = require("../models/User");
const Subject = require("../models/Subject");
const Class = require("../models/Class");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const logger = require("../config/logger");
const { decodeTokenFromParams, auth } = require("../middleware/auth"); // Middleware to verify user
const multer = require("multer"); // For handling file uploads
const path = require("path");
const transporter = require("../config/nodemailer");
// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

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

const sendCredentialsEmail = async (email, name, randomPassword) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Account Credentials",
    text: `Hello ${name},\n\nYour account has been created successfully. Here are your login credentials:\n\nUsername: ${name}\nPassword: ${randomPassword}\n\nPlease change your password after logging in.\n\nBest regards,\nAdmin`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Credentials email sent to ${email} successfully.`);
  } catch (error) {
    logger.error(
      `Failed to send credentials email to ${email}: ${error.message}`
    );
    throw new Error(
      "Could not send credentials email. Please try again later."
    );
  }
};

router.post("/create", auth, upload.single("photo"), async (req, res) => {
  try {
    const {
      name,
      dob,
      address,
      contactNumber,
      email,
      city,
      district,
      state,
      country,
      studentClass,
      studentsubjects,
      school,
    } = req.body;

    // Ensure the user is an admin
    if (req.user.role.name !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only admins can create teachers." });
    }

    // Validate required fields
    if (
      !name ||
      !dob ||
      !address ||
      !contactNumber ||
      !email ||
      !city ||
      !district ||
      !state ||
      !country ||
      !school
    ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Check if the school exists
    const schoolExists = await School.findById(school);
    if (!schoolExists) {
      return res.status(404).json({ msg: "School not found" });
    }

    let userRole = await Role.findOne({ name: "student" });
    if (!userRole) {
      return res.status(400).json({ msg: "Role does not exist" });
    }

    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Handle photo upload
    const photo = req.file ? req.file.buffer : null;

    // Create a new teacher
    const newStudent = new Student({
      name,
      dob,
      address,
      contactNumber,
      email,
      city,
      district,
      state,
      country,
      studentClass: studentClass
        ? studentClass.split(",").map((id) => id.trim())
        : [],
      studentsubjects: studentsubjects
        ? studentsubjects.split(",").map((id) => id.trim())
        : [],
      photo,
      school,
      addedBy: req.user._id,
      password: hashedPassword, // Save the hashed password
      role: userRole._id,
    });


    const token = newStudent.createEmailVerificationToken();

    await newStudent.save();

    // Send verification email
    await sendVerificationEmail(newStudent, token);

    // Send an email with the random password
    await sendCredentialsEmail(email, name, randomPassword);

    res
      .status(201)
      .json({ message: "Student created successfully", teacher: newStudent });
  } catch (error) {
    logger.error(`Error creating Student: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to create student", error: error.message });
  }
});

// Get all teachers
router.get("/", auth, async (req, res) => {
  console.log("requested user", req.user.school);
  try {
    const teachers = await Student.find({ school: req.user.school })
      .populate("school", "name")
      .populate("studentsubjects", "subjectName") // Populate subjects
      .populate("studentClass", "classname"); // Populate classes
    res.status(200).json(teachers);
  } catch (error) {
    console.error(`Error fetching students: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to fetch students", error: error.message });
  }
});

// Get a single teacher by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
    .populate("school", "name")
    .populate("studentsubjects", "subjectName") // Populate subjects
    .populate("studentClass", "classname"); // Populate classes;
    if (!teacher) {
      return res.status(404).json({ msg: "Student not found" });
    }
    res.status(200).json(teacher);
  } catch (error) {
    console.error(`Error fetching Student by ID: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to fetch student", error: error.message });
  }
});

// Update a teacher
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      address,
      city,
      district,
      state,
      country,
      studentsubjects,
      studentClass,
      photo,
    } = req.body;

    // Ensure the user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only admins can update student." });
    }

    const updatedTeacher = await Student.findByIdAndUpdate(
      req.params.id,
      {
        address,
        city,
        district,
        state,
        country,
        studentClass: studentClass
        ? studentClass.split(",").map((id) => id.trim())
        : [],
        studentsubjects: studentsubjects
        ? studentsubjects.split(",").map((id) => id.trim())
        : [],
        photo,
      },
      { new: true }
    ).populate("school", "name");

    if (!updatedTeacher) {
      return res.status(404).json({ msg: "Student not found" });
    }

    res
      .status(200)
      .json({
        message: "Student updated successfully",
        teacher: updatedTeacher,
      });
  } catch (error) {
    console.error(`Error updating student: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to update student", error: error.message });
  }
});

// Delete a teacher
router.delete("/:id", auth, async (req, res) => {
  try {
    // Ensure the user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only admins can delete students." });
    }

    const deletedTeacher = await Student.findByIdAndDelete(req.params.id);

    if (!deletedTeacher) {
      return res.status(404).json({ msg: "Students not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error(`Error deleting Student: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to delete Student", error: error.message });
  }
});

module.exports = router;
