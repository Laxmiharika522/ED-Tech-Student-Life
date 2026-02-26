const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password using bcrypt.
 *
 * @param {string} password  Plain-text password
 * @returns {Promise<string>} Bcrypt hash
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain-text password against a stored bcrypt hash.
 *
 * @param {string} password  Plain-text candidate password
 * @param {string} hash      Stored bcrypt hash
 * @returns {Promise<boolean>} true if they match
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Validate password strength before hashing.
 * Returns an error message string, or null if the password is acceptable.
 *
 * Rules:
 *  - Minimum 6 characters
 *  - At least one letter
 *  - At least one number
 *
 * @param {string} password
 * @returns {string|null}
 */
const validatePasswordStrength = (password) => {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  return null;
};

module.exports = { hashPassword, comparePassword, validatePasswordStrength };