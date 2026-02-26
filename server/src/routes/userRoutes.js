const router = require('express').Router();
const {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');
const {
  updateProfileRules,
  changePasswordRules,
  validate,
} = require('../middleware/validationMiddleware');

// All user routes require authentication
router.use(protect);

router.get('/profile',  getProfile);
router.put('/profile',  updateProfileRules, validate, updateProfile);
router.put('/avatar',   uploadAvatar.single('avatar'), updateAvatar);
router.put('/password', changePasswordRules, validate, changePassword);

module.exports = router;