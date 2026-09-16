const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Booking Confirmation - BookBeacon",
            text: `Hello ${userName},\n\nYour booking for "${eventTitle}" is confirmed. Thank you for choosing BookBeacon!`,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Booking confirmation email sent to ${userEmail}`);
    }
    catch (error) {
        console.error(`Error sending booking confirmation email to ${userEmail}:`, error);
    }
};
const sendOTPEmail = async (email, otp, type) => {
    try{
        const title = type === 'account_verification' ? 'Account Verification' : 'Event Booking';
        const msg = type === 'account_verification' ? `Your OTP for account verification is ${otp}. It will expire in 5 minutes.` : `Your OTP for event booking is ${otp}. It will expire in 5 minutes.`;


        const mailOptions = {
        from: process.env.EMAIL_USER,
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
    } catch (error) {
        console.error(`Error sending OTP email to ${email}:`, error);
    }
}; 
module.exports = { sendBookingEmail, sendOTPEmail };   