const noteModel = require('../models/noteModel');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/notes
 * List all approved notes — supports ?search, ?subject, ?university, ?page, ?limit
 */
const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search = '', subject = '', category = '', university = '', sortBy = 'recent' } = req.query;
    // userId may or may not exist — GET /notes is public but optionally authenticated
    const userId = req.user?.id || null;
    const result = await noteModel.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      subject,
      category,
      university,
      sortBy,
      userId,
    });

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
 * GET /api/notes/subjects
 * Get all distinct subjects for filter UI
 */
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await noteModel.getSubjects();
    res.json({ success: true, data: { subjects } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notes/my
 * Get notes uploaded by the authenticated user
 */
const getMyNotes = async (req, res, next) => {
  try {
    const notes = await noteModel.findByUploader(req.user.id);
    res.json({ success: true, data: { notes } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notes/:id
 * Get a single note by ID
 */
const getNoteById = async (req, res, next) => {
  try {
    const note = await noteModel.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }
    res.json({ success: true, data: { note } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notes/upload
 * Upload a new note (requires file + body fields)
 */
const uploadNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a file.' });
    }

    const { title, subject, category, description } = req.body;
    const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;

    const note = await noteModel.create({
      title,
      subject,
      category,
      description,
      fileUrl,
      uploaderId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully. It will be visible after admin approval.',
      data: { note },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notes/:id/download
 * Download a note file (increments counter)
 */
const downloadNote = async (req, res, next) => {
  try {
    const note = await noteModel.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }
    if (!note.is_approved) {
      return res.status(403).json({ success: false, message: 'This note is pending approval.' });
    }

    const filePath = path.join(__dirname, '../..', note.file_url.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    await noteModel.incrementDownloads(note.id);
    res.download(filePath);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notes/:id
 * Delete own note (or admin can delete any)
 */
const deleteNote = async (req, res, next) => {
  try {
    const note = await noteModel.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const isOwner = note.uploader_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this note.' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../..', note.file_url.replace(/^\//, ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await noteModel.remove(note.id);
    res.json({ success: true, message: 'Note deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notes/:id/approve  [Admin only]
 * Toggle approval status
 */
const approveNote = async (req, res, next) => {
  try {
    const { approved } = req.body;
    const note = await noteModel.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const updated = await noteModel.setApproved(note.id, approved);
    res.json({
      success: true,
      message: `Note ${approved ? 'approved' : 'unapproved'}.`,
      data: { note: updated },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notes/:id/like  [Protected]
 * Like a note
 */
const likeNote = async (req, res, next) => {
  try {
    const note = await noteModel.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    try {
      const likes = await noteModel.likeNote(note.id, req.user.id);
      res.json({ success: true, data: { likes, has_liked: true } });
    } catch (dupErr) {
      // Already liked — return current count without error
      const rows = await noteModel.findById(note.id);
      res.json({ success: true, data: { likes: rows.likes, has_liked: true } });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notes/:id/like  [Protected]
 * Unlike a note
 */
const unlikeNote = async (req, res, next) => {
  try {
    const note = await noteModel.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    const likes = await noteModel.unlikeNote(note.id, req.user.id);
    res.json({ success: true, data: { likes, has_liked: false } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notes/:id/rate  [Protected]
 * Rate a note 1–5 stars (upserts the user's rating)
 */
const rateNote = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const r = parseInt(rating, 10);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    const note = await noteModel.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    const updated = await noteModel.rateNote(note.id, req.user.id, r);
    res.json({
      success: true,
      data: { avg_rating: updated.avg_rating, rating_count: updated.rating_count, user_rating: r },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};