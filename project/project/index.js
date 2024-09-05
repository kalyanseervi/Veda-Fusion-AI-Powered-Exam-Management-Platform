const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Assume there's a config/db.js for MongoDB connection
const app = express();

// Connect Database
connectDB();

app.use(cors())
// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/roles')); // Admin routes for managing roles and permissions
app.use('/api/teachers',require('./routes/teacher'));
app.use('/api/subject',require('./routes/subject'));
app.use('/api/schools',require('./routes/school'));
app.use('/api/class',require('./routes/class'));
app.use('/api/exam',require('./routes/exam'));
app.use('/api/exam-questions',require('./routes/examQuestion'));
app.use('/api/assignExam',require('./routes/assignExam'));
app.use('/api/student',require('./routes/student'));
app.use('/api/protected', require('./routes/protected')); // Example of protected routes


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
