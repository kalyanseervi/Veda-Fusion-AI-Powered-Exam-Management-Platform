const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
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
const Student = require("../models/Student");
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
    let user;
    const {
      name,     
      email,
      teachingClasses,
      teachingSubjects,
      school,
    } = req.body;

    // Ensure the user is an admin
    if (req.user.role.name !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only admins can create teachers." });
    }
    user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User already exists with this email" });
    }
    user = await Teacher.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User already exists with this email" });
    }
    user = await Student.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User already exists with this email" });
    }

    // Validate required fields
    if (
      !name ||
      !email 
    ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    

    let userRole = await Role.findOne({ name: "teacher" });
    if (!userRole) {
      return res.status(400).json({ msg: "Role does not exist" });
    }

    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Handle photo upload
    

    // Create a new teacher
    const newTeacher = new Teacher({
      name,
    
      email,
      
      teachingClasses: teachingClasses
        ? teachingClasses.split(",").map((id) => id.trim())
        : [],
      teachingSubjects: teachingSubjects
        ? teachingSubjects.split(",").map((id) => id.trim())
        : [],
      school:req.user.school,
      addedBy: req.user._id,
      password: hashedPassword, // Save the hashed password
      role: userRole._id,
    });

    const token = newTeacher.createEmailVerificationToken();

    await newTeacher.save();

    // Send verification email
    await sendVerificationEmail(newTeacher, token);

    // Send an email with the random password
    await sendCredentialsEmail(email, name, randomPassword);

    res
      .status(201)
      .json({ message: "Teacher created successfully", teacher: newTeacher });
  } catch (error) {
    logger.error(`Error creating teacher: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to create teacher", error: error.message });
  }
});
// Get all teachers
router.get("/", auth, async (req, res) => {
 
  try {
    const teachers = await Teacher.find({ school: req.user.school })

      .populate("school", "name")
      .populate("teachingSubjects", "subjectName") // Populate subjects
      .populate("teachingClasses", "classname"); // Populate classes
    res.status(200).json(teachers);
  } catch (error) {
    console.error(`Error fetching teachers: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to fetch teachers", error: error.message });
  }
});

// Get a single teacher by ID
router.get("/singleTeacher/:id", auth, async (req, res) => {

  try {
    const teacher = await Teacher.findById(req.params.id)
    .populate("school", "name");
    if (!teacher) {
      return res.status(404).json({ msg: "Teacher not found" });
    }
    res.status(200).json(teacher);
  } catch (error) {
    console.error(`Error fetching teacher by ID: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to fetch teacher", error: error.message });
  }
});

// Update a teacher
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      teachingSubjects,
      teachingInClass,
    } = req.body;

    // Ensure the user is an admin
    if (req.user.role.name !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only admins can update teachers." });
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      {
        teachingSubjects: teachingSubjects.split(",").map((id) => id.trim()),
        teachingInClass: teachingInClass.split(",").map((id) => id.trim()),
      },
      { new: true }
    ).populate("school", "name");

    if (!updatedTeacher) {
      return res.status(404).json({ msg: "Teacher not found" });
    }

    res
      .status(200)
      .json({
        message: "Teacher updated successfully",
        teacher: updatedTeacher,
      });
  } catch (error) {
    console.error(`Error updating teacher: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to update teacher", error: error.message });
  }
});

// Delete a teacher
router.delete("/:id", auth, async (req, res) => {
  try {
    // Ensure the user is an admin
    if (req.user.role.name !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only admins can delete teachers." });
    }

    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!deletedTeacher) {
      return res.status(404).json({ msg: "Teacher not found" });
    }

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error(`Error deleting teacher: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to delete teacher", error: error.message });
  }
});

router.get("/studentByClassSubjects", auth, async (req, res) => {
    try {


        if (req.user.role.name !== "teacher") { // Assuming `role` is populated
            return res.status(403).json({ msg: "Access denied. Only teachers can access students." });
        }
       

        const teacher = await Teacher.findOne({email:req.user.email})
            .populate("teachingClasses")
            .populate("teachingSubjects");

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const classIds = teacher.teachingClasses.map((c) => c._id);
        const subjectIds = teacher.teachingSubjects.map((s) => s._id);

        const students = await Student.find({
            studentClass: { $in: classIds },
            studentsubjects: { $in: subjectIds },
            school:{$in:req.user.school}
        })
            .populate("studentClass")
            .populate("studentsubjects")
            .populate("school");

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching teacher by ID:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
