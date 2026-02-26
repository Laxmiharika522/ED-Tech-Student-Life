const router = require('express').Router();
const {
  getAllNotes,
  getSubjects,
  getMyNotes,
  getNoteById,
  uploadNote,
  downloadNote,
  deleteNote,
  approveNote,
  likeNote,
  unlikeNote,
  rateNote,
} = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { uploadNote: uploadNoteFile } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { createNoteRules, validate } = require('../middleware/validationMiddleware');

// Public
router.get('/', getAllNotes);
router.get('/subjects', getSubjects);

// Protected
router.use(protect);

router.get('/my', getMyNotes);
router.get('/:id', getNoteById);
router.get('/:id/download', downloadNote);

// Spread createNoteRules array so each validator is a separate middleware
router.post(
  '/upload',
  uploadLimiter,
  uploadNoteFile.single('file'),
  ...createNoteRules,   // ← spread fixes the 422
  validate,
  uploadNote
);

router.delete('/:id', deleteNote);
router.post('/:id/like', likeNote);
router.delete('/:id/like', unlikeNote);
router.post('/:id/rate', rateNote);

// Admin only
router.patch('/:id/approve', restrictTo('admin'), approveNote);

module.exports = router;