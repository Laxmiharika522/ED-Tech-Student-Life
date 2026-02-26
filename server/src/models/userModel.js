const { query } = require('../config/db');

const findByEmail = async (email) => {
  const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const rows = await query(
    'SELECT id, name, email, role, university, major, year, interests, is_verified, avatar_url, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

const create = async ({ name, email, passwordHash, university, role = 'student' }) => {
  const result = await query(
    'INSERT INTO users (name, email, password_hash, university, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, university || null, role]
  );
  return { id: result.insertId, name, email, university, role };
};

const update = async (id, fields) => {
  const allowed = ['name', 'university', 'avatar_url', 'major', 'year', 'interests', 'is_verified', 'role'];
  const updates = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (updates.length === 0) return null;

  values.push(id);
  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
  return findById(id);
};

const updatePassword = async (id, passwordHash) => {
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
};

const findAll = async ({ page = 1, limit = 20, search = '' }) => {
  const limitInt = parseInt(limit) || 20;
  const offsetInt = (parseInt(page) - 1) * limitInt;
  const searchParam = `%${search}%`;

  const rows = await query(
    `SELECT id, name, email, role, university, major, year, interests, is_verified, created_at
     FROM users
     WHERE name LIKE ? OR email LIKE ? OR university LIKE ? OR major LIKE ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [searchParam, searchParam, searchParam, searchParam, limitInt, offsetInt]
  );

  const countRows = await query(
    `SELECT COUNT(*) AS total FROM users WHERE name LIKE ? OR email LIKE ? OR university LIKE ? OR major LIKE ?`,
    [searchParam, searchParam, searchParam, searchParam]
  );

  return { users: rows, total: countRows[0].total };
};

const remove = async (id) => {
  await query('DELETE FROM users WHERE id = ?', [id]);
};

module.exports = { findByEmail, findById, create, update, updatePassword, findAll, remove };