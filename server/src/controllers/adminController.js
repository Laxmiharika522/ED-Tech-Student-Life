const adminService = require('../services/adminService');
const userModel = require('../models/userModel');
const noteModel = require('../models/noteModel');
const taskModel = require('../models/taskModel');
const { sendTaskAssignmentEmail } = require('../utils/emailUtils');
const { query } = require('../config/db');

/**
 * GET /api/admin/stats
 * Platform dashboard stats
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: { stats } });
  } catch (err) {
    next(err);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await adminService.getDetailedAnalytics();
    res.json({ success: true, data: { analytics } });
  } catch (err) {
    next(err);
  }
};

// ─── User Management ───────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await userModel.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });

    res.json({
      success: true,
      data: {
        users: result.users,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await userModel.remove(userId);
    res.json({ success: true, message: `User "${user.name}" deleted.` });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const updated = await userModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User updated.', data: { user: updated } });
  } catch (err) {
    next(err);
  }
};

// ─── Note Management ───────────────────────────────────────────────────────

/**
 * GET /api/admin/notes
 * All notes including pending
 */
const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await noteModel.findAllAdmin({ page: parseInt(page), limit: parseInt(limit) });

    res.json({
      success: true,
      data: {
        notes: result.notes,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/notes/:id/status
 */
const updateNoteStatus = async (req, res, next) => {
  try {
    const { is_approved } = req.body;
    const note = await noteModel.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });

    const updated = await noteModel.setApproved(req.params.id, is_approved);
    res.json({ success: true, message: `Note marked as ${is_approved ? 'approved' : 'flagged'}.`, data: { note: updated } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/notes/:id
 */
const deleteNote = async (req, res, next) => {
  try {
    const note = await noteModel.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });

    await noteModel.remove(req.params.id);
    res.json({ success: true, message: 'Note permanently deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── Roommate Management ───────────────────────────────────────────────────

/**
 * GET /api/admin/roommate/stats
 */
const getRoommateStats = async (req, res, next) => {
  try {
    const [profileStats] = await query(
      `SELECT
         COUNT(*) AS total_profiles,
         SUM(is_active = TRUE) AS active_profiles,
         SUM(gender = 'male') AS male_profiles,
         SUM(gender = 'female') AS female_profiles,
         AVG(cleanliness) AS avg_cleanliness,
         AVG(sleep_schedule) AS avg_sleep
       FROM roommate_profiles`
    );

    const [matchStats] = await query(
      `SELECT
         COUNT(*) AS total_matches,
         SUM(status = 'pending') AS pending_matches,
         SUM(status = 'accepted') AS accepted_matches,
         SUM(status = 'rejected') AS rejected_matches
       FROM roommate_matches`
    );

    // Get recent accepted matches
    const recentMatches = await query(
      `SELECT rm.*, u1.name AS user1_name, u2.name AS user2_name
       FROM roommate_matches rm
       JOIN users u1 ON rm.user1_id = u1.id
       JOIN users u2 ON rm.user2_id = u2.id
       WHERE rm.status = 'accepted'
       ORDER BY rm.created_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        profiles: profileStats,
        matches: matchStats,
        recentMatches
      }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Task Management ───────────────────────────────────────────────────────

/**
 * GET /api/admin/tasks
 */
const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const result = await taskModel.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });

    res.json({
      success: true,
      data: {
        tasks: result.tasks,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, category, assigned_to, due_date } = req.body;
    const task = await taskModel.create({
      title,
      description,
      category,
      assignedTo: assigned_to || null,
      createdBy: req.user.id,
      dueDate: due_date || null,
    });

    // Email notification for the assigned user
    if (task.assigned_to) {
      const assignee = await userModel.findById(task.assigned_to);
      if (assignee) {
        sendTaskAssignmentEmail(assignee, task).catch((e) =>
          console.warn('⚠️  Task email failed:', e.message)
        );
      }
    }

    res.status(201).json({ success: true, message: 'Task created.', data: { task } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/tasks/:id/status
 * Specialized endpoint for users to update task status
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await taskModel.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Security: Only allow updating if it's assigned to you OR it's unassigned (global) OR you're an admin
    if (task.assigned_to !== null && task.assigned_to !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only update your own tasks.' });
    }

    const updateFields = { status };
    if (status === 'done') {
      const { status: _, ...formData } = req.body;
      if (Object.keys(formData).length > 0) {
        updateFields.submission_data = formData;
      }
    }

    const updated = await taskModel.update(task.id, updateFields);
    res.json({ success: true, message: 'Task status updated.', data: { task: updated } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const { title, description, assigned_to, status, due_date } = req.body;
    const task = await taskModel.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const updated = await taskModel.update(task.id, {
      title,
      description,
      assigned_to,
      status,
      due_date,
    });

    res.json({ success: true, message: 'Task updated.', data: { task: updated } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await taskModel.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await taskModel.remove(task.id);
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/tasks/my
 * Tasks assigned to the authenticated user (works for any role)
 */
const getMyTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await taskModel.findByAssignedUser(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/tasks/:id/clone
 * Clone an existing task for recurring needs
 */
const cloneTask = async (req, res, next) => {
  try {
    const task = await taskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Source task not found.' });

    const cloned = await taskModel.create({
      title: `${task.title} (Copy)`,
      description: task.description,
      category: task.category,
      assignedTo: task.assigned_to,
      createdBy: req.user.id,
      dueDate: null, // Reset due date as it's likely a new month
    });

    res.status(201).json({ success: true, message: 'Task cloned successfully.', data: { task: cloned } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  getAnalytics,
  getUsers,
  deleteUser,
  getAllNotes,
  updateNoteStatus,
  deleteNote,
  getRoommateStats,
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMyTasks,
  cloneTask,
  updateUser,
};