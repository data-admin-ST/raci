const express = require('express');
const { 
  login, 
  getMe, 
  refreshToken, 
  logout,
  changePassword,
  forgotPassword,
  verifyOTP,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Password management routes
router.post('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
