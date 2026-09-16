const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/protect');
const { getRazorpayKey, createOrder, verifyPayment } = require('../controllers/paymentController');

router.get('/key', protect, getRazorpayKey);
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);

module.exports = router;