const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/hashUtils');
const { generateToken } = require('../utils/jwtUtils');
const { sendWelcomeEmail } = require('../utils/emailUtils');

/**
 * Register a new student user
 */
const register = async ({ name, email, password, university }) => {
  // Check for duplicate email
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const user = await userModel.create({ name, email, passwordHash, university });

  // Send welcome email (non-blocking — don't fail registration if email fails)
  sendWelcomeEmail(user).catch((e) =>
    console.warn('⚠️  Welcome email failed:', e.message)
  );

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
};

/**
 * Login an existing user
 */
const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);

  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const passwordMatch = await comparePassword(password, user.password_hash);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // Strip password hash before returning
  const { password_hash, ...safeUser } = user;
  const token = generateToken({ id: safeUser.id, email: safeUser.email, role: safeUser.role });

  return { user: safeUser, token };
};

module.exports = { register, login };