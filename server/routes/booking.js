const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/protect");
const { 
    bookEvent, 
    sendBookingOTP, 
    getMyBookings, 
    getAllBookings, // <--- Import this
    confirmBooking, 
    cancelBooking 
} = require("../controllers/bookingController");

router.post('/', protect, bookEvent);
router.post('/send-otp', protect, sendBookingOTP);
router.get('/mybookings', protect, getMyBookings);
router.get('/all', protect, admin, getAllBookings); // <--- Add this route
router.put('/:bookingId/confirm', protect, admin, confirmBooking);
router.delete('/:bookingId', protect, cancelBooking);

module.exports = router;