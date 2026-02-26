const { query } = require('../config/db');
const noteModel = require('../models/noteModel');
const roommateModel = require('../models/roommateModel');

/**
 * GET /api/stats/public
 * App-wide statistics for the homepage
 */
const getPublicStats = async (req, res, next) => {
    try {
        const [noteStats] = await query(
            `SELECT COUNT(*) AS total_notes, SUM(downloads) AS total_downloads
             FROM notes WHERE is_approved = 1`
        );
        const [matchStats] = await query(
            `SELECT COUNT(*) AS total_matches FROM roommate_matches WHERE status = 'accepted'`
        );
        const [uniStats] = await query(
            `SELECT COUNT(DISTINCT university) AS total_universities FROM users`
        );

        res.json({
            success: true,
            data: {
                notesShared: noteStats.total_notes || 0,
                matchesMade: matchStats.total_matches || 0,
                totalDownloads: noteStats.total_downloads || 0,
                colleges: uniStats.total_universities || 0,
            },
        });
    } catch (err) { next(err); }
};

/**
 * GET /api/stats/recent-notes
 * Latest 6 approved notes
 */
const getRecentNotes = async (req, res, next) => {
    try {
        const notes = await noteModel.findRecent(6);
        res.json({ success: true, data: { notes } });
    } catch (err) { next(err); }
};

/**
 * GET /api/stats/dashboard  [Protected]
 * Personalised data for the logged-in student's home page:
 *  - their own uploaded notes
 *  - their bidirectional roommate matches
 *  - most active subjects (from their uploads)
 *  - top contributors (uploaders of notes in those same subjects, excluding self)
 */
const getUserDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // 1. User's own notes (latest 6)
        const myNotes = await query(
            `SELECT id, title, subject, category, downloads, likes, avg_rating, created_at
             FROM notes WHERE uploader_id = ? AND is_approved = 1
             ORDER BY created_at DESC LIMIT 6`,
            [userId]
        );

        // 2. Bidirectional matches for this user
        const matches = await roommateModel.getMatchesByUser(userId);

        // 3. Most active subjects (subjects the user has uploaded to, sorted by count)
        const subjects = await query(
            `SELECT subject, COUNT(*) AS note_count
             FROM notes WHERE uploader_id = ? AND is_approved = 1
             GROUP BY subject
             ORDER BY note_count DESC
             LIMIT 5`,
            [userId]
        );

        // 4. Top contributors in those same subjects (other users)
        let contributors = [];
        if (subjects.length > 0) {
            const subjectList = subjects.map(s => s.subject);
            const placeholders = subjectList.map(() => '?').join(',');
            contributors = await query(
                `SELECT u.id, u.name, u.university, u.avatar_url,
                        COUNT(*) AS shared_count,
                        GROUP_CONCAT(DISTINCT n.subject ORDER BY n.subject SEPARATOR ', ') AS subjects
                 FROM notes n
                 JOIN users u ON n.uploader_id = u.id
                 WHERE n.is_approved = 1
                   AND n.subject IN (${placeholders})
                   AND n.uploader_id != ?
                 GROUP BY u.id
                 ORDER BY shared_count DESC
                 LIMIT 5`,
                [...subjectList, userId]
            );
        }

        res.json({
            success: true,
            data: { myNotes, matches, subjects, contributors },
        });
    } catch (err) { next(err); }
};

module.exports = { getPublicStats, getRecentNotes, getUserDashboard };
