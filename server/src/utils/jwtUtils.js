const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a signed JWT token for a user.
 *
 * @param {Object} payload  - Data to embed: { id, email, role }
 * @returns {string}          Signed JWT string
 */
const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Verify a JWT token and return the decoded payload.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 *
 * @param {string} token
 * @returns {Object} Decoded payload { id, email, role, iat, exp }
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Decode a token WITHOUT verifying its signature.
 * Only use this when you need to read the payload and don't
 * care about authenticity (e.g. logging, debugging).
 *
 * @param {string} token
 * @returns {Object|null}
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Generate a short-lived token for password reset links (15 min).
 *
 * @param {number} userId
 * @returns {string}
 */
const generateResetToken = (userId) => {
  return jwt.sign({ id: userId, purpose: 'reset' }, env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

module.exports = { generateToken, verifyToken, decodeToken, generateResetToken };