const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public', statsController.getPublicStats);
router.get('/recent-notes', statsController.getRecentNotes);
router.get('/dashboard', protect, statsController.getUserDashboard);

module.exports = router;
