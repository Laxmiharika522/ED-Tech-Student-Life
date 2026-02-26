const roommateModel = require('../models/roommateModel');
const { sendRoommateMatchEmail } = require('../utils/emailUtils');
const userModel = require('../models/userModel');

/**
 * Attribute weights for compatibility scoring (must sum to 1.0)
 */
const WEIGHTS = {
  sleep_schedule: 0.35,
  cleanliness: 0.25,
  study_habits: 0.25,
  budget_range: 0.15,
};

/**
 * Compute compatibility score (0–100) between two roommate profiles
 * @param {Object} profileA
 * @param {Object} profileB
 * @returns {number} score
 */
const computeScore = (profileA, profileB) => {
  let score = 0;

  // sleep_schedule — exact match
  if (profileA.sleep_schedule === profileB.sleep_schedule) {
    score += WEIGHTS.sleep_schedule * 100;
  } else if (
    profileA.sleep_schedule === 'flexible' ||
    profileB.sleep_schedule === 'flexible'
  ) {
    score += WEIGHTS.sleep_schedule * 60; // partial credit for flexible
  }

  // cleanliness — score based on how close the values are (1-5 scale)
  const cleanDiff = Math.abs(profileA.cleanliness - profileB.cleanliness);
  const cleanScore = Math.max(0, 100 - cleanDiff * 25); // 0 diff = 100, 4 diff = 0
  score += WEIGHTS.cleanliness * cleanScore;

  // study_habits — exact match
  if (profileA.study_habits === profileB.study_habits) {
    score += WEIGHTS.study_habits * 100;
  }

  // budget_range — exact string match (e.g. "$500-$700")
  if (
    profileA.budget_range &&
    profileB.budget_range &&
    profileA.budget_range === profileB.budget_range
  ) {
    score += WEIGHTS.budget_range * 100;
  } else if (!profileA.budget_range || !profileB.budget_range) {
    score += WEIGHTS.budget_range * 50; // neutral if either hasn't set budget
  }

  return Math.round(score * 10) / 10; // round to 1 decimal
};

/**
 * Run the matching process for a single user:
 * 1. Fetch all other active profiles
 * 2. Compute scores
 * 3. Save top matches to DB
 * 4. Optionally notify matches above threshold via email
 *
 * @param {number} userId
 * @param {boolean} notify - send email notifications for high-quality matches
 * @returns {Array} sorted matches
 */
const runMatchingForUser = async (userId, notify = false) => {
  const userProfile = await roommateModel.getProfileByUserId(userId);
  if (!userProfile) {
    const err = new Error('Complete your roommate profile before running matching.');
    err.statusCode = 400;
    throw err;
  }

  const otherProfiles = await roommateModel.getAllActiveProfiles(userId);
  if (otherProfiles.length === 0) return [];

  // 1. Same-gender filtering
  const sameGenderProfiles = otherProfiles.filter(p => p.gender === userProfile.gender);
  if (sameGenderProfiles.length === 0) return [];

  // 2. Compute scores for all same-gender candidates
  const scored = sameGenderProfiles.map((candidate) => ({
    userId: candidate.user_id,
    name: candidate.name,
    score: computeScore(userProfile, candidate),
  }));

  // Sort descending and take top 10
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 10);

  // Delete old matches and save new ones
  await roommateModel.deleteMatchesByUser(userId);
  for (const match of top) {
    await roommateModel.createMatch(userId, match.userId, match.score);
  }

  // Notify high-quality matches (score >= 75)
  if (notify) {
    const currentUser = await userModel.findById(userId);
    for (const match of top.filter((m) => m.score >= 75)) {
      const matchUser = await userModel.findById(match.userId);
      if (matchUser) {
        sendRoommateMatchEmail(matchUser, {
          name: currentUser.name,
          score: match.score,
        }).catch((e) => console.warn('⚠️  Match email failed:', e.message));
      }
    }
  }

  return top;
};

module.exports = { computeScore, runMatchingForUser };