const cron = require('node-cron');
const Exam = require('../models/Exam'); // Adjust path as necessary

// Schedule a task to run every minute (adjust as needed)
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    console.log('Current Time:', now);

    // Update exams that have not yet started to 'Incoming'
    const resultIncoming = await Exam.updateMany(
      { examDate: { $gt: now }, examStatus: { $ne: 'Incoming' } },
      { $set: { examStatus: 'Incoming' } }
    );
    console.log(`Updated Incoming: ${resultIncoming.modifiedCount} documents`);

    // Calculate ongoing exams based on examDate and examDuration
    const ongoingExams = await Exam.find({
      examDate: { $lte: now },
      examDuration: { $exists: true },
      examStatus: { $ne: 'Ongoing' }
    });

    for (const exam of ongoingExams) {
      const examEndDate = new Date(exam.examDate.getTime() + exam.examDuration * 60 * 1000);

      if (examEndDate >= now) {
        await Exam.updateOne(
          { _id: exam._id },
          { $set: { examStatus: 'Ongoing' } }
        );
      }
    }
    console.log(`Updated Ongoing`);

    // Update exams that have ended
    const resultCompleted = await Exam.updateMany(
      { 
        $expr: {
          $lt: [
            { $add: [ "$examDate", { $multiply: [ "$examDuration", 60 * 1000 ] } ] },
            now
          ]
        },
        examStatus: { $ne: 'Completed' }
      },
      { $set: { examStatus: 'Completed' } }
    );
    console.log(`Updated Completed: ${resultCompleted.modifiedCount} documents`);



  } catch (error) {
    console.error('Error updating exam statuses:', error);
  }
});
