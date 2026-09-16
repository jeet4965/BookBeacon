const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodeMailer.createTransport({
    service: "gmail",
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
});

const getFromAddress = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email is not configured. Set EMAIL_USER and EMAIL_PASS in server/.env.');
    }

    return `BookBeacon <${process.env.EMAIL_USER}>`;
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    const mailOptions = {
        from: getFromAddress(),
        to: userEmail,
        subject: "Booking Confirmation - BookBeacon",
        text: `Hello ${userName},\n\nYour booking for "${eventTitle}" is confirmed. Thank you for choosing BookBeacon!`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${userEmail}`);
};
const sendOTPEmail = async (email, otp, type) => {
    const title = type === 'account_verification' ? 'Account Verification' : 'Event Booking';
    const msg = type === 'account_verification' ? `Your OTP for account verification is ${otp}. It will expire in 5 minutes.` : `Your OTP for event booking is ${otp}. It will expire in 5 minutes.`;


        const mailOptions = {
        from: getFromAddress(),
        to: email,
        subject: title,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #111;">${title}</h2>
                <p style="color: #555; font-size: 16px;">${msg}</p>
                <div style="margin-top: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                    ${otp}
                </div>
                <p style="color: #555; font-size: 12px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
            </div>
            `
        };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email} for ${type}`);
}; 
module.exports = { sendBookingEmail, sendOTPEmail };
