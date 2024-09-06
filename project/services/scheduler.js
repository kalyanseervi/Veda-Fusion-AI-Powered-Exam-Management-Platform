const cron = require('node-cron');
const Exam = require('../models/Exam'); // Adjust path as necessary
const moment = require('moment'); // For handling date and time

// Schedule a task to run every minute (adjust as needed)
cron.schedule('* * * * *', async () => {
  try {
    const now = moment(); // Use moment to get the current time
    console.log('Current Time:', now.format());

    // Update exams that have not yet started to 'Incoming'
    const resultIncoming = await Exam.updateMany(
      { 
        examDate: { $gt: now.toDate() }, 
        examStatus: { $ne: 'Incoming' } 
      },
      { $set: { examStatus: 'Incoming' } }
    );
    console.log(`Updated Incoming: ${resultIncoming.modifiedCount} documents`);

    // Find exams that should be 'Ongoing'
    const ongoingExams = await Exam.find({
      examDate: { $lte: now.toDate() }, // examDate is earlier or equal to now
      examDuration: { $exists: true },
      
    });
    console.log('Ongoing Exams:', ongoingExams.length);

    for (const exam of ongoingExams) {
      const examEndTime = moment(exam.examEndTime); // Fetch stored examEndTime

      if (examEndTime.isSameOrAfter(now)) { // If current time is before examEndTime
        await Exam.updateOne(
          { _id: exam._id },
          {
            $set: {
              examStatus: 'Ongoing',
              examEndTime: examEndTime.toDate() // Ensure examEndTime is stored
            },
          }
        );
      }
    }
    console.log(`Updated Ongoing exams`);

    // Update exams that have ended
    const resultCompleted = await Exam.updateMany(
      {
        examEndTime: { $lt: now.toDate() }, // Compare against the stored examEndTime
        examStatus: { $ne: 'Completed' }
      },
      { $set: { examStatus: 'Completed' } }
    );
    console.log(`Updated Completed: ${resultCompleted.modifiedCount} documents`);

  } catch (error) {
    console.error('Error updating exam statuses:', error);
  }
});
