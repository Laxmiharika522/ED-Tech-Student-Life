const router = require('express').Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerRules,
  loginRules,
  validate,
} = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login',    authLimiter, loginRules,    validate, login);

// Protected
router.get('/me', protect, getMe);

module.exports = router;