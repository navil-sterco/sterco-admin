const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, logout, getMe } = require('../controllers/authController');
const { loginValidation } = require('../utils/validators');
const handleValidation = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

router.post('/login', authLimiter, loginValidation, handleValidation, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
