const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

const sendVerificationOTP = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email, action: 'account_verification' });
    await OTP.create({ email, otp, action: 'account_verification' });
    await sendOTPEmail(email, otp, 'account_verification');
};


// Register a new user
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    let userExists = await User.findOne({ email });
    if (userExists) {
        if (!userExists.isVerified) {
            try {
                await sendVerificationOTP(email);
                return res.status(200).json({ message: 'A new verification OTP has been sent.', email });
            } catch (error) {
                console.error(`Unable to resend verification OTP to ${email}:`, error.message);
                return res.status(503).json({ error: 'We could not send the verification email. Please try again shortly.' });
            }
        }
        return res.status(400).json({ error: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        const user = await User.create({ name, email, password: hashedPassword, role: 'user', isVerified: false });

        await sendVerificationOTP(email);

        res.status(201).json({ message: 'User registered successfully. Please verify your email.',
        email: user.email
        });

    } catch (error) {
        console.error(`Registration failed for ${email}:`, error.message);
        res.status(503).json({ error: 'Account created, but the verification email could not be sent. Sign in to request another OTP.' });
    }
};


// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials, Please Sign Up First' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified && user.role === 'user') {
        try {
            await sendVerificationOTP(email);
        } catch (error) {
            console.error(`Unable to send verification OTP to ${email}:`, error.message);
            return res.status(503).json({ error: 'We could not send the verification email. Please try again shortly.' });
        }
        return res.status(403).json({
            error: 'Account not verified. Please check your email for the OTP to verify your account.',
            needsVerification: true,
        });
    }

    res.json({ 
        message: 'Login successful', 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        token: generateToken(user._id, user.role)
    });
};        

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp, action: 'account_verification' });

    if (!otpRecord) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteMany({ email, action: 'account_verification' }); // Remove the OTP after successful verification

    res.json(
       { 
        message: 'Account verified successfully.',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
       }
    );
};
