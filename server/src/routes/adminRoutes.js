const router = require('express').Router();
const {
  getStats,
  getUsers,
  deleteUser,
  updateUser,
  getAllNotes,
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMyTasks,
  cloneTask,
  updateNoteStatus,
  deleteNote,
  getRoommateStats,
  getAnalytics,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { createTaskRules, validate } = require('../middleware/validationMiddleware');

// All routes require auth
router.use(protect);

// My tasks (any authenticated user can view their assigned tasks)
router.get('/tasks/my', getMyTasks);
router.put('/tasks/:id/status', updateTaskStatus);

// Everything below requires admin role
router.use(restrictTo('admin'));

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Notes moderation
router.get('/notes', getAllNotes);
router.put('/notes/:id/status', updateNoteStatus);
router.delete('/notes/:id', deleteNote);

// Roommate matching analytics
router.get('/roommate/stats', getRoommateStats);

// Tasks
router.get('/tasks', getTasks);
router.post('/tasks', createTaskRules, validate, createTask);
router.put('/tasks/:id', updateTask);
router.post('/tasks/:id/clone', cloneTask);
router.delete('/tasks/:id', deleteTask);

module.exports = router;