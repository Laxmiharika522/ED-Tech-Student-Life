const { query } = require('../config/db');

// ─── Roommate Profiles ─────────────────────────────────────────────────────

/**
 * Create or replace a roommate profile for a user
 */
const createProfile = async (userId, data) => {
  const {
    sleep_schedule, cleanliness, study_habits,
    gender, budget_range, bio,
  } = data;

  // Upsert pattern — update if already exists
  await query(
    `INSERT INTO roommate_profiles
       (user_id, sleep_schedule, cleanliness, study_habits, gender, budget_range, bio)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       sleep_schedule = VALUES(sleep_schedule),
       cleanliness    = VALUES(cleanliness),
       study_habits   = VALUES(study_habits),
       gender         = VALUES(gender),
       budget_range   = VALUES(budget_range),
       bio            = VALUES(bio),
       is_active      = TRUE`,
    [userId, sleep_schedule, cleanliness, study_habits, gender, budget_range || null, bio || null]
  );

  return getProfileByUserId(userId);
};

/**
 * Get a roommate profile by user_id (with user info)
 */
const getProfileByUserId = async (userId) => {
  const rows = await query(
    `SELECT rp.*, u.name, u.university, u.avatar_url
     FROM roommate_profiles rp
     JOIN users u ON rp.user_id = u.id
     WHERE rp.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
};

/**
 * Get all active roommate profiles except the requesting user
 */
const getAllActiveProfiles = async (excludeUserId) => {
  const rows = await query(
    `SELECT rp.*, u.name, u.university, u.avatar_url
     FROM roommate_profiles rp
     JOIN users u ON rp.user_id = u.id
     WHERE rp.is_active = TRUE AND rp.user_id != ?`,
    [excludeUserId]
  );
  return rows;
};

/**
 * Deactivate a roommate profile (user opts out of matching)
 */
const deactivateProfile = async (userId) => {
  await query('UPDATE roommate_profiles SET is_active = FALSE WHERE user_id = ?', [userId]);
};

// ─── Roommate Matches ──────────────────────────────────────────────────────

/**
 * Create a match between two users with a computed score
 */
const createMatch = async (user1Id, user2Id, matchScore) => {
  // Ensure consistent ordering to avoid duplicate pairs
  const [a, b] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

  const existing = await query(
    'SELECT id FROM roommate_matches WHERE user1_id = ? AND user2_id = ?',
    [a, b]
  );

  if (existing.length > 0) {
    // Update score if match already exists
    await query(
      'UPDATE roommate_matches SET match_score = ? WHERE user1_id = ? AND user2_id = ?',
      [matchScore, a, b]
    );
    return existing[0];
  }

  const result = await query(
    'INSERT INTO roommate_matches (user1_id, user2_id, match_score) VALUES (?, ?, ?)',
    [a, b, matchScore]
  );
  return { id: result.insertId };
};

/**
 * Get all matches for a user with profile details
 */
const getMatchesByUser = async (userId) => {
  const rows = await query(
    `SELECT
       rm.id, rm.match_score, rm.status, rm.created_at,
       CASE WHEN rm.user1_id = ? THEN rm.user2_id ELSE rm.user1_id END AS matched_user_id,
       u.name AS matched_name, u.university AS matched_university, u.avatar_url,
       rp.sleep_schedule, rp.cleanliness, rp.study_habits, rp.gender, rp.budget_range, rp.bio
     FROM roommate_matches rm
     JOIN users u ON u.id = CASE WHEN rm.user1_id = ? THEN rm.user2_id ELSE rm.user1_id END
     JOIN roommate_profiles rp ON rp.user_id = u.id
     WHERE (rm.user1_id = ? OR rm.user2_id = ?)
       AND rm.status != 'rejected'
     ORDER BY rm.match_score DESC`,
    [userId, userId, userId, userId]
  );
  return rows;
};

/**
 * Update match status (accepted / rejected)
 */
const updateMatchStatus = async (matchId, userId, status) => {
  // Only one of the two users can update the status
  await query(
    `UPDATE roommate_matches SET status = ?
     WHERE id = ? AND (user1_id = ? OR user2_id = ?)`,
    [status, matchId, userId, userId]
  );
};

/**
 * Delete all existing matches for a user (called before recomputing)
 */
const deleteMatchesByUser = async (userId) => {
  await query(
    'DELETE FROM roommate_matches WHERE user1_id = ? OR user2_id = ?',
    [userId, userId]
  );
};

module.exports = {
  createProfile,
  getProfileByUserId,
  getAllActiveProfiles,
  deactivateProfile,
  createMatch,
  getMatchesByUser,
  updateMatchStatus,
  deleteMatchesByUser,
};