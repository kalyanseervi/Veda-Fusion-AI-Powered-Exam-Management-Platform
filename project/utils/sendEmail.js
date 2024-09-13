const nodemailer = require('nodemailer');

// Email utility to send emails
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // or other email service provider
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
