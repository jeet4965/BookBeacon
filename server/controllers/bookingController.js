const Booking = require('../models/Bookingmodel');
const OTP = require('../models/OTP');
const Event = require('../models/Eventmodel');
const { sendOTPEmail, sendBookingEmail } = require('../utils/email');  

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendBookingOTP = async (req, res) => {
    const otp = generateOTP();
    await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
    await OTP.create({ email: req.user.email, otp, action: 'event_booking' });
    await sendOTPEmail(req.user.email, otp, 'event_booking');
    res.json({ message: 'OTP sent to your email for booking confirmation.' });
};

exports.bookEvent = async (req, res) => {
    const { eventId, otp } = req.body;

    const otpRecord = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
    if (!otpRecord) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    if (event.availableSeats <= 0) {
        return res.status(400).json({ error: 'No available seats for this event' });
    }

    // FIX 1: Match schema field names (userId & eventId) so duplicate checks actually work
    const existingBooking = await Booking.findOne({ userId: req.user._id, eventId });
    if (existingBooking) {
        return res.status(400).json({ error: 'You have already booked this event' });
    }

    const booking = await Booking.create({ 
        userId: req.user._id,
        eventId,
        status: 'pending',
        paymentStatus: 'unpaid',
        amount: event.ticketPrice,
    });

    await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });
    res.status(201).json({ message: 'Booking successful. A confirmation email has been sent.', booking });
};

// FIX 2: Added getAllBookings for Admin dashboard
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate('eventId', 'title date ticketPrice')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.confirmBooking = async (req, res) => {
    const paymentStatus = req.body.paymentStatus;
    if (!['paid', 'unpaid'].includes(paymentStatus)) {
        return res.status(400).json({ error: 'Invalid payment status' });
    }

    // Populate userId to get attendee's email
    const booking = await Booking.findById(req.params.bookingId)
        .populate('eventId')
        .populate('userId');

    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'confirmed') {
        return res.status(400).json({ error: 'Booking is already confirmed' });
    }

    const event = await Event.findById(booking.eventId._id);
    if (event.availableSeats <= 0) {
        return res.status(400).json({ error: 'No available seats for this event' });
    }

    booking.status = 'confirmed';
    booking.paymentStatus = paymentStatus;
    await booking.save();

    event.availableSeats -= 1;
    await event.save();

    // FIX 3: Send confirmation to the customer, not the logged-in admin
    if (booking.userId?.email) {
        await sendBookingEmail(booking.userId.email, event.title, booking._id);
    }
    
    res.json({ message: 'Booking confirmed successfully.' });
};

exports.getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ userId: req.user._id }).populate('eventId');
    res.json(bookings);
};

exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }

    // Allow the original user or an admin to cancel/reject
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to cancel this booking' });
    }

    // FIX 4: Check if it was confirmed before deletion so seats are freed up properly
    if (booking.status === 'confirmed') {
        const event = await Event.findById(booking.eventId);
        if (event) {
            event.availableSeats += 1;
            await event.save();
        }
    }

    // FIX 5: Use .deleteOne() instead of .remove()
    await booking.deleteOne();
    res.json({ message: 'Booking cancelled successfully.' });
};