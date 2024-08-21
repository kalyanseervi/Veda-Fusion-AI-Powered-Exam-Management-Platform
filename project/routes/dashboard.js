const express = require('express');
const protect = require('./../middleware/authMiddleware'); // Assuming the middleware is saved as protect.js

const router = express.Router();

router.get('/admin', protect(['admin']), (req, res) => {
    res.status(200).json({ msg: 'Welcome to the admin area' });
});

router.get('/teacher', protect(['teacher']), (req, res) => {
    res.status(200).json({ msg: 'Welcome to the teacher area' });
});

router.get('/student', protect(['student']), (req, res) => {
    res.status(200).json({ msg: 'Welcome to the student area' });
});