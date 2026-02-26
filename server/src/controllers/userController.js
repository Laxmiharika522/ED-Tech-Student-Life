const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/hashUtils');
const path = require('path');

/**
 * GET /api/users/profile
 * Get the authenticated user's own profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/profile
 * Update name, university
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, university } = req.body;
    const updated = await userModel.update(req.user.id, { name, university });
    res.json({ success: true, message: 'Profile updated.', data: { user: updated } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/avatar
 * Upload a profile picture
 */
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const avatarUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    const updated = await userModel.update(req.user.id, { avatar_url: avatarUrl });

    res.json({ success: true, message: 'Avatar updated.', data: { user: updated } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/password
 * Change password — requires current password for verification
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Re-fetch user with password hash
    const userWithHash = await userModel.findByEmail(req.user.email);
    const isMatch = await comparePassword(currentPassword, userWithHash.password_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHash = await hashPassword(newPassword);
    await userModel.updatePassword(req.user.id, newHash);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, updateAvatar, changePassword };