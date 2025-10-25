const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/auth');
const controller = require('../controllers/bookingController');

router.post('/', authMiddleware, controller.createBooking);
router.post('/verify', authMiddleware, controller.verifyAndTransfer);
router.get('/my', authMiddleware, controller.myBookings);
router.get('/host/bookings', authMiddleware, controller.hostBookings);

module.exports = router;
