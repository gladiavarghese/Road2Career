const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return { accessToken };
};

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role = 'student' } = req.body;

    // Check if user exists
    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) throw new AppError('Email already registered.', 409);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    const allowedRole = role === 'admin' ? 'student' : role; // Only admin can create admin

    // Create user
    const userResult = await query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email.toLowerCase(), passwordHash, allowedRole]
    );
    const user = userResult.rows[0];

    // Create student profile
    if (allowedRole === 'student') {
      await query(
        'INSERT INTO student_profiles (user_id, first_name, last_name) VALUES ($1, $2, $3)',
        [user.id, firstName, lastName]
      );
    }

    // Log activity
    await query(
      "INSERT INTO progress (user_id, activity_type, activity_title, xp_earned) VALUES ($1, 'skill_added', 'Account Created', 10)",
      [user.id]
    );

    // Create welcome notification
    await query(
      "INSERT INTO notifications (user_id, title, message, notification_type) VALUES ($1, 'Welcome to Road2Career! 🎉', 'Your journey to your dream career starts now. Set up your profile and generate your first AI roadmap!', 'info')",
      [user.id]
    );

    const { accessToken } = generateTokens(user.id);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: { user: { id: user.id, email: user.email, role: user.role, firstName, lastName }, token: accessToken },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT u.id, u.email, u.password_hash, u.role, u.is_active, sp.first_name, sp.last_name, sp.avatar_url FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.email = $1',
      [email.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) throw new AppError('Invalid email or password.', 401);
    if (!user.is_active) throw new AppError('Account is deactivated. Contact support.', 403);

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) throw new AppError('Invalid email or password.', 401);

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const { accessToken } = generateTokens(user.id);

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
        },
        token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.created_at, u.last_login,
       sp.first_name, sp.last_name, sp.phone, sp.bio, sp.avatar_url,
       sp.college, sp.degree, sp.graduation_year, sp.linkedin_url, sp.github_url,
       sp.portfolio_url, sp.career_readiness_score, sp.learning_streak, sp.total_xp,
       cp.title as career_goal_title, cp.slug as career_goal_slug
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN career_paths cp ON sp.career_goal_id = cp.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) throw new AppError('User not found.', 404);

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    
    // Always return success to prevent email enumeration
    if (!result.rows.length) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [token, expires, result.rows[0].id]
    );

    // In production, send email. For now, return token in dev mode.
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    logger.info(`Password reset URL: ${resetUrl}`);

    res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV === 'development' && { resetUrl, token }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const result = await query(
      'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );

    if (!result.rows.length) throw new AppError('Invalid or expired reset token.', 400);

    const passwordHash = await bcrypt.hash(password, 12);
    await query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [passwordHash, result.rows[0].id]
    );

    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValid) throw new AppError('Current password is incorrect.', 400);

    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, changePassword };
