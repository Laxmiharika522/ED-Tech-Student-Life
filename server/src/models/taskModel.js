const { query } = require('../config/db');

/**
 * Create a new task
 */
const create = async ({ title, description, category, assignedTo, createdBy, dueDate }) => {
  let formattedDate = dueDate;
  if (dueDate && typeof dueDate === 'string' && dueDate.includes('T')) {
    formattedDate = dueDate.split('T')[0];
  }

  const result = await query(
    `INSERT INTO tasks (title, description, category, assigned_to, created_by, due_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description || null, category || 'Administrative', assignedTo || null, createdBy, formattedDate || null]
  );
  return findById(result.insertId);
};

/**
 * Find a task by ID (with user info)
 */
const findById = async (id) => {
  const rows = await query(
    `SELECT t.*,
            a.name AS assigned_to_name, a.email AS assigned_to_email,
            c.name AS created_by_name
     FROM tasks t
     LEFT JOIN users a ON t.assigned_to = a.id
     LEFT JOIN users c ON t.created_by = c.id
     WHERE t.id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Get all tasks (admin) with optional status filter and pagination
 */
const findAll = async ({ page = 1, limit = 20, status = '' }) => {
  const offset = (page - 1) * limit;
  const statusFilter = status ? `AND t.status = '${status}'` : '';

  const rows = await query(
    `SELECT t.*,
            a.name AS assigned_to_name,
            c.name AS created_by_name
     FROM tasks t
     LEFT JOIN users a ON t.assigned_to = a.id
     LEFT JOIN users c ON t.created_by = c.id
     WHERE 1=1 ${statusFilter}
     ORDER BY t.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const countRows = await query(
    `SELECT COUNT(*) AS total FROM tasks WHERE 1=1 ${statusFilter}`
  );

  return { tasks: rows, total: countRows[0].total };
};

/**
 * Get tasks assigned to a specific user
 */
const findByAssignedUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;

  const rows = await query(
    `SELECT t.*, c.name AS created_by_name
     FROM tasks t
     LEFT JOIN users c ON t.created_by = c.id
     WHERE t.assigned_to = ? OR t.assigned_to IS NULL
     ORDER BY t.due_date ASC, t.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const countRows = await query(
    'SELECT COUNT(*) AS total FROM tasks WHERE assigned_to = ? OR assigned_to IS NULL',
    [userId]
  );

  return { tasks: rows, total: countRows[0].total };
};

/**
 * Update task fields
 */
const update = async (id, fields) => {
  const allowed = ['title', 'description', 'category', 'assigned_to', 'status', 'due_date', 'submission_data'];
  const updates = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      let val = fields[key];
      // Format date if it's an ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
      if (key === 'due_date' && val && typeof val === 'string' && val.includes('T')) {
        val = val.split('T')[0];
      }
      updates.push(`${key} = ?`);
      values.push(val);
    }
  }

  if (updates.length === 0) return findById(id);

  values.push(id);
  await query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);
  return findById(id);
};

/**
 * Delete a task
 */
const remove = async (id) => {
  await query('DELETE FROM tasks WHERE id = ?', [id]);
};

/**
 * Get task stats summary for admin dashboard
 */
const getStats = async () => {
  const rows = await query(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'pending') AS pending,
       SUM(status = 'in_progress') AS in_progress,
       SUM(status = 'done') AS done,
       SUM(due_date < CURDATE() AND status != 'done') AS overdue
     FROM tasks`
  );
  return rows[0];
};

module.exports = { create, findById, findAll, findByAssignedUser, update, remove, getStats };