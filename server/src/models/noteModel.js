const { query } = require('../config/db');

const create = async ({ title, subject, category, description, fileUrl, uploaderId }) => {
  const result = await query(
    `INSERT INTO notes (title, subject, category, description, file_url, uploader_id, is_approved) VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [title, subject, category, description || null, fileUrl, uploaderId]
  );
  return findById(result.insertId);
};

const findById = async (id) => {
  const rows = await query(
    `SELECT n.*, u.name AS uploader_name, u.university AS uploader_university
     FROM notes n LEFT JOIN users u ON n.uploader_id = u.id WHERE n.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const findAll = async ({
  page = 1, limit = 12, subject = '', category = '', search = '',
  university = '', sortBy = 'recent', userId = null
}) => {
  const L = Math.abs(parseInt(limit, 10)) || 12;
  const O = (Math.abs(parseInt(page, 10)) - 1) * L;
  const s = '%' + search + '%';
  const sub = subject ? '%' + subject + '%' : '%';
  const cat = category ? '%' + category + '%' : '%';
  const uni = university ? '%' + university + '%' : '%';

  const orderMap = {
    likes: 'n.likes DESC, n.created_at DESC',
    rating: 'n.avg_rating DESC, n.rating_count DESC, n.created_at DESC',
    recent: 'n.created_at DESC',
  };
  const orderClause = orderMap[sortBy] || orderMap.recent;

  const uid = userId ? parseInt(userId, 10) : null;
  const hasLikedSql = uid ? `(SELECT COUNT(*) FROM note_likes   nl WHERE nl.note_id = n.id AND nl.user_id = ${uid}) AS has_liked,` : `0 AS has_liked,`;
  const userRatingSql = uid ? `(SELECT rating FROM note_ratings nr WHERE nr.note_id = n.id AND nr.user_id = ${uid} LIMIT 1) AS user_rating,` : `NULL AS user_rating,`;

  const rows = await query(
    `SELECT n.id, n.title, n.subject, n.category, n.description, n.file_url,
            n.downloads, n.likes, n.avg_rating, n.rating_count,
            ${hasLikedSql}
            ${userRatingSql}
            n.created_at, u.name AS uploader_name, u.university
     FROM notes n LEFT JOIN users u ON n.uploader_id = u.id
     WHERE n.is_approved = 1
       AND (n.title LIKE ? OR n.description LIKE ?)
       AND n.subject LIKE ?
       AND n.category LIKE ?
       AND (u.university LIKE ? OR u.university IS NULL)
     ORDER BY ${orderClause}
     LIMIT ${L} OFFSET ${O}`,
    [s, s, sub, cat, uni]
  );

  const countRows = await query(
    `SELECT COUNT(*) AS total FROM notes n LEFT JOIN users u ON n.uploader_id = u.id
     WHERE n.is_approved = 1
       AND (n.title LIKE ? OR n.description LIKE ?)
       AND n.subject LIKE ?
       AND n.category LIKE ?
       AND (u.university LIKE ? OR u.university IS NULL)`,
    [s, s, sub, cat, uni]
  );

  return { notes: rows, total: countRows[0].total };
};

const findAllAdmin = async ({ page = 1, limit = 20 }) => {
  const L = Math.abs(parseInt(limit, 10)) || 20;
  const O = (Math.abs(parseInt(page, 10)) - 1) * L;
  const rows = await query(
    `SELECT n.*, u.name AS uploader_name FROM notes n
     LEFT JOIN users u ON n.uploader_id = u.id
     ORDER BY n.created_at DESC LIMIT ${L} OFFSET ${O}`,
    []
  );
  const countRows = await query('SELECT COUNT(*) AS total FROM notes');
  return { notes: rows, total: countRows[0].total };
};

const findByUploader = async (uploaderId) => {
  return query(`SELECT * FROM notes WHERE uploader_id = ? ORDER BY created_at DESC`, [uploaderId]);
};

const setApproved = async (id, approved) => {
  await query('UPDATE notes SET is_approved = ? WHERE id = ?', [approved, id]);
  return findById(id);
};

const incrementDownloads = async (id) => {
  await query('UPDATE notes SET downloads = downloads + 1 WHERE id = ?', [id]);
};

const remove = async (id) => {
  await query('DELETE FROM notes WHERE id = ?', [id]);
};

const findRecent = async (limit = 5) => {
  return query(
    `SELECT n.id, n.title, n.subject, n.file_url, n.created_at, u.name AS uploader_name
     FROM notes n LEFT JOIN users u ON n.uploader_id = u.id
     WHERE n.is_approved = 1
     ORDER BY n.created_at DESC LIMIT ?`,
    [limit]
  );
};

const findPopular = async (limit = 5) => {
  return query(
    `SELECT n.id, n.title, n.subject, n.downloads, n.likes, n.avg_rating, n.created_at, u.name AS uploader_name
     FROM notes n LEFT JOIN users u ON n.uploader_id = u.id
     WHERE n.is_approved = 1
     ORDER BY n.downloads DESC LIMIT ?`,
    [limit]
  );
};

const getSubjects = async () => {
  const rows = await query('SELECT DISTINCT subject FROM notes WHERE is_approved = 1 ORDER BY subject ASC');
  return rows.map((r) => r.subject);
};

/* ─── Likes ─────────────────────────────────────────────────────── */
const likeNote = async (noteId, userId) => {
  await query('INSERT INTO note_likes (note_id, user_id) VALUES (?, ?)', [noteId, userId]);
  await query('UPDATE notes SET likes = likes + 1 WHERE id = ?', [noteId]);
  const rows = await query('SELECT likes FROM notes WHERE id = ?', [noteId]);
  return rows[0]?.likes ?? 0;
};

const unlikeNote = async (noteId, userId) => {
  const result = await query('DELETE FROM note_likes WHERE note_id = ? AND user_id = ?', [noteId, userId]);
  if (result.affectedRows > 0) {
    await query('UPDATE notes SET likes = GREATEST(likes - 1, 0) WHERE id = ?', [noteId]);
  }
  const rows = await query('SELECT likes FROM notes WHERE id = ?', [noteId]);
  return rows[0]?.likes ?? 0;
};

const hasLiked = async (noteId, userId) => {
  const rows = await query('SELECT id FROM note_likes WHERE note_id = ? AND user_id = ?', [noteId, userId]);
  return rows.length > 0;
};

/* ─── Ratings ────────────────────────────────────────────────────── */

// Recalculate and persist avg_rating + rating_count from note_ratings table
const _refreshRating = async (noteId) => {
  await query(
    `UPDATE notes SET
       avg_rating   = (SELECT COALESCE(AVG(rating), 0) FROM note_ratings WHERE note_id = ?),
       rating_count = (SELECT COUNT(*)                 FROM note_ratings WHERE note_id = ?)
     WHERE id = ?`,
    [noteId, noteId, noteId]
  );
  const rows = await query('SELECT avg_rating, rating_count FROM notes WHERE id = ?', [noteId]);
  return rows[0];
};

const rateNote = async (noteId, userId, rating) => {
  // Upsert: insert or update the user's rating for this note
  await query(
    `INSERT INTO note_ratings (note_id, user_id, rating)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP`,
    [noteId, userId, rating]
  );
  return _refreshRating(noteId);
};

const deleteRating = async (noteId, userId) => {
  await query('DELETE FROM note_ratings WHERE note_id = ? AND user_id = ?', [noteId, userId]);
  return _refreshRating(noteId);
};

const getUserRating = async (noteId, userId) => {
  const rows = await query('SELECT rating FROM note_ratings WHERE note_id = ? AND user_id = ?', [noteId, userId]);
  return rows[0]?.rating ?? null;
};

module.exports = {
  create,
  findById,
  findAll,
  findAllAdmin,
  findByUploader,
  setApproved,
  incrementDownloads,
  remove,
  getSubjects,
  findRecent,
  findPopular,
  likeNote,
  unlikeNote,
  hasLiked,
  rateNote,
  deleteRating,
  getUserRating,
};