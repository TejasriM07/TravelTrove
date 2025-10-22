const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');

const crypto = require('crypto');

// createSendToken: issue JWT and set cookie (immediate login on signup)
const signinToken = (id) => {
  const jwtExpires = process.env.JWT_EXPIRES_IN || '90d';
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: jwtExpires });
};

const createSendToken = (user, statusCode, res) => {
  const token = signinToken(user._id);
  const cookieDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 90;
  const cookieOptions = {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  };
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, user });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, avatar, isHost } = req.body;
    if (!name || !email || !phone || !password) return res.status(400).json({ message: 'Missing fields' });
    if (!validator.isEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
    if (!/^[0-9+\-() ]{7,15}$/.test(phone)) return res.status(400).json({ message: 'Invalid phone format' });
    
    // Password validation: at least 6 chars, at least 1 number, at least 1 special character
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (!/\d/.test(password)) return res.status(400).json({ message: 'Password must contain at least one number' });
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return res.status(400).json({ message: 'Password must contain at least one special character' });
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, phone, password, avatar, isHost: isHost || false });
    createSendToken(user, 201, res);
  } catch (err) {
    console.error(err);
    // Handle duplicate key error specifically
    if (err && err.code === 11000) {
      const key = Object.keys(err.keyValue || {})[0];
      const value = err.keyValue ? err.keyValue[key] : '';
      return res.status(400).json({ status: 'fail', message: `${key} already exists: ${value}` });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    if (!validator.isEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    // If role is 'host', set isHost to true for this session
    // (The actual isHost in DB was set at registration time)
    // Frontend can choose to login as host or guest regardless of DB value
    if (role === 'host') {
      user.isHost = true;
    } else if (role === 'guest') {
      user.isHost = false;
    }
    
    createSendToken(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json({ user });
};

exports.updateMe = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, avatar } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    user.password = undefined;
    res.json({ status: 'success', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing old or new password' });
    }
    
    // Password validation for new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must contain at least one number' });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must contain at least one special character' });
    }
    
    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    user.password = undefined;
    res.json({ status: 'success', message: 'Password updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Delete user from database
    await User.findByIdAndDelete(userId);
    
    // Clear authentication cookie
    res.clearCookie('jwt');
    
    res.json({ status: 'success', message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verify = async (req, res) => {
  try {
    const { userId, type, token } = req.body;
    if (!userId || !type || !token) return res.status(400).json({ message: 'Missing parameters' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.verificationExpires < new Date()) return res.status(400).json({ message: 'Token expired' });
    if (type === 'email') {
      if (user.emailVerificationToken !== token) return res.status(400).json({ message: 'Invalid token' });
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
    } else if (type === 'phone') {
      if (user.phoneVerificationToken !== token) return res.status(400).json({ message: 'Invalid token' });
      user.isPhoneVerified = true;
      user.phoneVerificationToken = null;
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }
    await user.save();
    res.json({ message: 'Verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save host Razorpay account id after host onboarding (the onboarding flow is
// expected to be implemented with Razorpay Connect separately). We accept a
// razorpayAccountId and flag user as host.
exports.saveRazorpayAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { razorpayAccountId } = req.body;
    if (!razorpayAccountId) return res.status(400).json({ message: 'Missing razorpayAccountId' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.razorpayAccountId = razorpayAccountId;
    user.isHost = true;
    await user.save();
    res.json({ message: 'Razorpay account saved', razorpayAccountId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a Razorpay onboarding URL (stub).
// In a production setup you must call Razorpay's Partner API to create an onboarding link
// and redirect the host to Razorpay for KYC. Here we return a simulated URL and
// instruct the host to complete onboarding and then call /auth/razorpay-account to save their account id.
exports.createRazorpayOnboard = async (req, res) => {
  try {
    const userId = req.userId;
    const { businessName, phone, email } = req.body;
    // validate
    if (!businessName || !phone) return res.status(400).json({ message: 'Missing fields' });

    // In real integration, call Razorpay Partners API to create onboarding link and return it.
    const fakeToken = crypto.randomBytes(8).toString('hex');
    const onboardingUrl = `https://razorpay.com/onboard?merchant=${userId}&token=${fakeToken}`;

    // Optionally store onboarding request metadata (omitted for brevity)
    res.json({ onboardingUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save Razorpay account id for a host (alternate clearer route)
exports.saveRazorpayAccountId = async (req, res) => {
  try {
    const userId = req.userId;
    const { razorpayAccountId } = req.body;
    if (!razorpayAccountId) return res.status(400).json({ message: 'Missing razorpayAccountId' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.razorpayAccountId = razorpayAccountId;
    user.isHost = true;
    await user.save();
    res.json({ message: 'Saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Webhook to be called by Razorpay (or your middleware) after onboarding completes.
// For development this endpoint accepts a payload { merchant, razorpayAccountId }
// and marks the corresponding user as host.
exports.razorpayOnboardWebhook = async (req, res) => {
  try {
    const { merchant, razorpayAccountId } = req.body;
    if (!merchant || !razorpayAccountId) return res.status(400).json({ message: 'Missing fields' });
    // merchant is expected to be the user id we sent when creating onboarding link
    const user = await User.findById(merchant);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.razorpayAccountId = razorpayAccountId;
    user.isHost = true;
    await user.save();
    res.json({ message: 'User onboarded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
