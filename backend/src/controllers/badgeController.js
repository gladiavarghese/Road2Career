const { query } = require('../config/db');

/**
 * GET /api/badges - All available badges
 */
const getAllBadges = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM badges WHERE is_active = true ORDER BY xp_reward');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/badges/student - Student's earned badges
 */
const getStudentBadges = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT b.*, ub.earned_at FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1 ORDER BY ub.earned_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllBadges, getStudentBadges };
