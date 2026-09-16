const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Bookingmodel');
const Event = require('../models/Eventmodel');
const { sendBookingEmail } = require('../utils/email');

// Check environment variables at startup
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('CRITICAL WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from server/.env');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Expose public key to frontend securely
exports.getRazorpayKey = (req, res) => {
    if (!process.env.RAZORPAY_KEY_ID) {
        return res.status(500).json({ error: 'Razorpay key is not configured in server environment' });
    }
    res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// Step 1: Create Order
exports.createOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId).populate('eventId');

        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        if (booking.amount <= 0) return res.status(400).json({ error: 'This is a free event' });

        const options = {
            amount: Math.round(booking.amount * 100), // Ensures integer paise value
            currency: 'INR',
            receipt: `rcpt_${booking._id}`,
        };

        const order = await razorpay.orders.create(options);

        booking.razorpayOrderId = order.id;
        await booking.save();

        res.json({
            orderId: order.id,
            id: order.id, // Fallback for frontend
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error('Create Razorpay Order Error:', error);
        res.status(500).json({ error: error.message || 'Error creating Razorpay order' });
    }
};

// Step 2: Verify Payment & Confirm
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        const booking = await Booking.findById(bookingId).populate('eventId').populate('userId');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        const event = await Event.findById(booking.eventId._id);
        if (!event || event.availableSeats <= 0) {
            return res.status(400).json({ error: 'No available seats left' });
        }

        booking.status = 'confirmed';
        booking.paymentStatus = 'paid';
        booking.razorpayPaymentId = razorpay_payment_id;
        booking.razorpaySignature = razorpay_signature;
        await booking.save();

        event.availableSeats -= 1;
        await event.save();

        // Send email confirmation
        if (booking.userId?.email) {
            try {
                await sendBookingEmail(booking.userId.email, booking.userId.name, event.title);
            } catch (mailErr) {
                console.warn('Booking confirmed, but email sending failed:', mailErr.message);
            }
        }

        res.json({ message: 'Payment verified and booking confirmed successfully!' });
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ error: error.message || 'Payment verification failed' });
    }
};