const cron = require('node-cron');
const Exam = require('../models/Exam'); // Adjust the path as necessary
const moment = require('moment'); // For handling date and time

// Schedule a task to run every minute (adjust the cron expression as needed)
cron.schedule('* * * * *', async () => {
  try {
    const now = moment(); // Use moment to get the current time
    console.log('Scheduler running at:', now.format());

    // 1. Update exams that have not started yet to 'Incoming'
    const incomingResult = await Exam.updateMany(
      {
        examDate: { $gt: now.toDate() }, // Exams that haven't started yet
        examStatus: { $ne: 'Incoming' } // Exams that are not already 'Incoming'
      },
      { $set: { examStatus: 'Incoming' } }
    );
    console.log(`Updated to 'Incoming': ${incomingResult.modifiedCount} exams`);

    // 2. Find and update ongoing exams
    const ongoingExams = await Exam.find({
      examDate: { $lte: now.toDate() }, // Exam should have started
      examEndTime: { $gt: now.toDate() }, // Exam should not have ended
      examStatus: { $ne: 'Ongoing' } // Exams that are not already 'Ongoing'
    });
    console.log("outl",ongoingExams)

    for (const exam of ongoingExams) {
      await Exam.updateOne(
        { _id: exam._id },
        { $set: { examStatus: 'Ongoing' } }
      );
    }
    console.log(`Updated to 'Ongoing': ${ongoingExams.length} exams`);

    // 3. Update exams that have ended to 'Completed'
    const completedResult = await Exam.updateMany(
      {
        examEndTime: { $lt: now.toDate() }, // Exams that have ended
        examStatus: { $ne: 'Completed' } // Exams that are not already 'Completed'
      },
      { $set: { examStatus: 'Completed' } }
    );
    console.log(`Updated to 'Completed': ${completedResult.modifiedCount} exams`);

  } catch (error) {
    console.error('Error updating exam statuses:', error);
  }
});
