const roommateModel = require('../models/roommateModel');
const matchingService = require('../services/matchingService');

/**
 * GET /api/roommate/profile
 * Get the authenticated user's roommate profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await roommateModel.getProfileByUserId(req.user.id);
    res.json({ success: true, data: { profile: profile || null } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/roommate/profile
 * Create or update the authenticated user's roommate profile
 * After saving, automatically re-runs the matching algorithm
 */
const saveProfile = async (req, res, next) => {
  try {
    const profile = await roommateModel.createProfile(req.user.id, req.body);

    // Re-run matching in background (non-blocking)
    matchingService.runMatchingForUser(req.user.id, true).catch((e) =>
      console.warn('⚠️  Matching run failed:', e.message)
    );

    res.status(201).json({
      success: true,
      message: 'Roommate profile saved. Finding your best matches...',
      data: { profile },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/roommate/matches
 * Get top roommate matches for the authenticated user
 */
const getMatches = async (req, res, next) => {
  try {
    const matches = await roommateModel.getMatchesByUser(req.user.id);
    res.json({ success: true, data: { matches } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/roommate/find-matches
 * Manually trigger re-computation of matches
 */
const findMatches = async (req, res, next) => {
  try {
    const topMatches = await matchingService.runMatchingForUser(req.user.id, false);
    const matches = await roommateModel.getMatchesByUser(req.user.id);
    res.json({
      success: true,
      message: `Found ${topMatches.length} matches.`,
      data: { matches },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/roommate/matches/:matchId
 * Accept or reject a roommate match
 */
const updateMatchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    await roommateModel.updateMatchStatus(req.params.matchId, req.user.id, status);
    res.json({ success: true, message: `Match ${status}.` });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/roommate/profile
 * Deactivate profile (opt out of matching)
 */
const deactivateProfile = async (req, res, next) => {
  try {
    await roommateModel.deactivateProfile(req.user.id);
    res.json({ success: true, message: 'Roommate profile deactivated.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyProfile,
  saveProfile,
  getMatches,
  findMatches,
  updateMatchStatus,
  deactivateProfile,
};