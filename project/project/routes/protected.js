const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// Route accessible by admin only
router.get('/admin', auth, authorize('admin'), (req, res) => {
    res.status(200).json({ msg: 'Welcome, Admin' });
});

// Route accessible by admin and teacher
router.get('/admin-teacher', auth, authorize('admin', 'teacher'), (req, res) => {
    res.status(200).json({ msg: 'Welcome, Admin or Teacher' });
});

// Route accessible by all authenticated users
router.get('/all', auth, (req, res) => {
    res.status(200).json({ msg: 'Welcome, authenticated user' });
});

module.exports = router;
