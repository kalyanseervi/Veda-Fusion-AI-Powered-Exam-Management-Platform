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
    text: `Hello ${name},\n\nYour account has been created successfully. Here are your login credentials:\n\nUsername: ${email}\nPassword: ${randomPassword}\n\nPlease change your password after logging in.\n\nBest regards,\nAdmin`,
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
      email,
      studentClass,
      studentsubjects,
    } = req.body;

    // Ensure the user is an admin
    if (req.user.role.name !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only admins can create students." });
    }
    let user

    user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ msg: 'User already exists with email' });
    }
    user = await Teacher.findOne({ email });
    if (user) {
        return res.status(400).json({ msg: 'User already exists with email' });
    }
    user = await Student.findOne({ email });
    if (user) {
        return res.status(400).json({ msg: 'User already exists with email' });
    }


    // Validate required fields
    if (
      !name ||
      !email 
    ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }


    let userRole = await Role.findOne({ name: "student" });
    if (!userRole) {
      return res.status(400).json({ msg: "Role does not exist" });
    }

    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);


    // Create a new teacher
    const newStudent = new Student({
      name,
      email,
      studentClass: studentClass
        ? studentClass.split(",").map((id) => id.trim())
        : [],
      studentsubjects: studentsubjects
        ? studentsubjects.split(",").map((id) => id.trim())
        : [],
      school:req.user.school,
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

// Get all Students
router.get("/", auth, async (req, res) => {
 
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
   

    const teacher = await Student.findById(req.params.id)
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
router.put("/:id", auth, upload.none(), async (req, res) => {
  try {
    const {
      name,
      studentsubjects,
      studentClass,
      photo, // If you plan to handle photo uploads
    } = req.body;

    console.log('i am here', req.body);

    // Ensure the user is an admin
    if (req.user.role.name !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only admins can update student." });
    }

    // Prepare the update data
    const updateData = {
      name,
      studentClass: studentClass ? studentClass.split(",").map(id => id.trim()) : [],
      studentsubjects: studentsubjects ? studentsubjects.split(",").map(id => id.trim()) : [],
    };

    // If you want to handle photo uploads, include that in the updateData
    if (photo && photo !== 'null') {
      // Handle the photo upload logic here, e.g., saving the photo URL or file path
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("school", "name");

    if (!updatedStudent) {
      return res.status(404).json({ msg: "Student not found" });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent, // Optionally return the updated student
    });
  } catch (error) {
    console.error(`Error updating student: ${error.message}`);
    res.status(500).json({ message: "Failed to update student", error: error.message });
  }
});

// Delete a teacher
router.delete("/:id", auth, async (req, res) => {
  try {
  
    // Ensure the user is an admin
    if (req.user.role.name !== "admin") {
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
