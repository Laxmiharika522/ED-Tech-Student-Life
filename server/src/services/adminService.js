const { query } = require('../config/db');
const taskModel = require('../models/taskModel');

/**
 * Get platform-wide statistics for the admin dashboard
 */
const getDashboardStats = async () => {
  const [userStats] = await query(
    `SELECT
       COUNT(*) AS total_users,
       SUM(role = 'student') AS students,
       SUM(role = 'admin') AS admins
     FROM users`
  );

  const [noteStats] = await query(
    `SELECT
       COUNT(*) AS total_notes,
       SUM(is_approved = TRUE) AS approved_notes,
       SUM(is_approved = FALSE) AS pending_notes,
       SUM(downloads) AS total_downloads
     FROM notes`
  );

  const [roommateStats] = await query(
    `SELECT
       COUNT(*) AS total_profiles,
       SUM(is_active = TRUE) AS active_profiles
     FROM roommate_profiles`
  );

  const [matchStats] = await query(
    `SELECT
       COUNT(*) AS total_matches,
       SUM(status = 'accepted') AS accepted_matches
     FROM roommate_matches`
  );

  const taskStats = await taskModel.getStats();

  // Recent activity — last 5 registrations
  const recentUsers = await query(
    `SELECT id, name, email, university, created_at
     FROM users ORDER BY created_at DESC LIMIT 5`
  );

  return {
    users: userStats,
    notes: noteStats,
    roommate: { ...roommateStats, ...matchStats },
    tasks: taskStats,
    recentUsers,
  };
};

/**
 * Get detailed analytics for charts and ranking
 */
const getDetailedAnalytics = async () => {
  const popularNotes = await query(
    `SELECT n.id, n.title, n.subject, n.downloads, u.name AS uploader_name
     FROM notes n JOIN users u ON n.uploader_id = u.id
     ORDER BY n.downloads DESC LIMIT 10`
  );

  const categoryStats = await query(
    `SELECT subject, COUNT(*) AS count, SUM(downloads) AS total_downloads
     FROM notes GROUP BY subject ORDER BY total_downloads DESC`
  );

  const userGrowth = await query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date, COUNT(*) AS count
     FROM users GROUP BY date ORDER BY date DESC LIMIT 14`
  );

  return {
    popularNotes,
    categoryStats,
    userGrowth: userGrowth.reverse()
  };
};

module.exports = { getDashboardStats, getDetailedAnalytics };