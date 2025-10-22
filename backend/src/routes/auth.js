const express = require('express');
const router = express.Router();
const { register, login, me, logout, updateMe, saveRazorpayAccount, saveRazorpayAccountId, verify, createRazorpayOnboard, razorpayOnboardWebhook, updatePassword, deleteMe } = require('../controllers/authController');
const { authMiddleware } = require('../utils/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.patch('/updateMe', authMiddleware, updateMe);
router.patch('/updatePassword', authMiddleware, updatePassword);
router.delete('/deleteMe', authMiddleware, deleteMe);
router.post('/logout', logout);
router.post('/verify', verify);
router.post('/razorpay-account', authMiddleware, saveRazorpayAccount);
router.post('/razorpay-onboard', authMiddleware, createRazorpayOnboard);
router.post('/save-razorpay-id', authMiddleware, saveRazorpayAccountId);
// webhook endpoint (no auth) - in production verify signature
router.post('/webhook/razorpay-onboard', razorpayOnboardWebhook);

module.exports = router;
