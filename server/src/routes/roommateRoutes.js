const router = require('express').Router();
const {
  getMyProfile,
  saveProfile,
  getMatches,
  findMatches,
  updateMatchStatus,
  deactivateProfile,
} = require('../controllers/roommateController');
const { protect } = require('../middleware/authMiddleware');
const { roommateProfileRules, validate } = require('../middleware/validationMiddleware');

// All roommate routes require authentication
router.use(protect);

router.get('/profile',            getMyProfile);
router.post('/profile',           roommateProfileRules, validate, saveProfile);
router.delete('/profile',         deactivateProfile);

router.get('/matches',            getMatches);
router.post('/find-matches',      findMatches);
router.patch('/matches/:matchId', updateMatchStatus);

module.exports = router;