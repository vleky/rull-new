// src/utils/emailService.js

const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.SMTP_EMAIL,
        pass: config.SMTP_PASSWORD,
    },
});

module.exports = {
    sendEmail: async (to, subject, text) => {
        await transporter.sendMail({
            from: config.SMTP_EMAIL,
            to,
            subject,
            text,
        });
    },
};
