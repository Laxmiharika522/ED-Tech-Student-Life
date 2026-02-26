const { body, param, query, validationResult } = require('express-validator');

/**
 * Runs after validation rules — returns 422 if any rule failed
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth Rules ────────────────────────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().notEmpty().withMessage('Email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

// ─── Note Rules ────────────────────────────────────────────────────────────
const createNoteRules = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('subject').trim().notEmpty().withMessage('Subject is required.').isLength({ max: 100 }),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.')
    .isIn(['Exam Prep', 'Summary', 'Cheat Sheets', 'Mind Maps', 'Theory', 'Other'])
    .withMessage('Invalid category.'),
  body('description').optional().trim().isLength({ max: 1000 }),
];

// ─── Roommate Rules ────────────────────────────────────────────────────────
const roommateProfileRules = [
  body('sleep_schedule')
    .isIn(['early', 'night_owl', 'flexible'])
    .withMessage('Invalid sleep schedule.'),
  body('cleanliness')
    .isInt({ min: 1, max: 5 })
    .withMessage('Cleanliness must be between 1 and 5.'),
  body('study_habits')
    .isIn(['quiet', 'music', 'social'])
    .withMessage('Invalid study habits value.'),
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender selection.'),
  body('budget_range').optional().trim().isLength({ max: 50 }),
  body('bio').optional().trim().isLength({ max: 500 }),
];

// ─── Task Rules ────────────────────────────────────────────────────────────
const createTaskRules = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('assigned_to').optional().isInt().withMessage('assigned_to must be a user ID.'),
  body('due_date').optional().isISO8601().withMessage('due_date must be a valid date.'),
];

// ─── Profile Rules ─────────────────────────────────────────────────────────
const updateProfileRules = [
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('university').optional().trim().isLength({ max: 150 }),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters.'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  createNoteRules,
  roommateProfileRules,
  createTaskRules,
  updateProfileRules,
  changePasswordRules,
};