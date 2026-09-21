const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.created_at, u.last_login,
       sp.first_name, sp.last_name, sp.phone, sp.bio, sp.avatar_url,
       sp.college, sp.degree, sp.graduation_year, sp.linkedin_url, sp.github_url,
       sp.portfolio_url, sp.career_readiness_score, sp.learning_streak, sp.total_xp,
       cp.id as career_goal_id, cp.title as career_goal_title, cp.slug as career_goal_slug,
       cp.icon as career_goal_icon
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN career_paths cp ON sp.career_goal_id = cp.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (!result.rows.length) throw new AppError('Profile not found.', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, bio, college, degree, graduationYear, linkedinUrl, githubUrl, portfolioUrl, careerGoalId } = req.body;

    const result = await query(
      `UPDATE student_profiles SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        bio = COALESCE($4, bio),
        college = COALESCE($5, college),
        degree = COALESCE($6, degree),
        graduation_year = COALESCE($7, graduation_year),
        linkedin_url = COALESCE($8, linkedin_url),
        github_url = COALESCE($9, github_url),
        portfolio_url = COALESCE($10, portfolio_url),
        career_goal_id = COALESCE($11, career_goal_id)
      WHERE user_id = $12
      RETURNING *`,
      [firstName, lastName, phone, bio, college, degree, graduationYear, linkedinUrl, githubUrl, portfolioUrl, careerGoalId, req.user.id]
    );

    if (!result.rows.length) throw new AppError('Profile not found.', 404);
    res.json({ success: true, message: 'Profile updated successfully.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/avatar
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded.', 400);

    // Delete old avatar
    const oldResult = await query('SELECT avatar_url FROM student_profiles WHERE user_id = $1', [req.user.id]);
    if (oldResult.rows[0]?.avatar_url) {
      const oldPath = path.join(__dirname, '../../', oldResult.rows[0].avatar_url.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await query('UPDATE student_profiles SET avatar_url = $1 WHERE user_id = $2', [avatarUrl, req.user.id]);

    res.json({ success: true, message: 'Avatar uploaded successfully.', data: { avatarUrl } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/dashboard
 * Aggregated dashboard data
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Profile
    const profileResult = await query(
      `SELECT sp.*, cp.title as career_goal_title, cp.slug as career_goal_slug, cp.icon as career_goal_icon
       FROM student_profiles sp LEFT JOIN career_paths cp ON sp.career_goal_id = cp.id
       WHERE sp.user_id = $1`,
      [userId]
    );

    // Skill count
    const skillCount = await query('SELECT COUNT(*) as count FROM student_skills WHERE user_id = $1', [userId]);

    // Active roadmap
    const roadmapResult = await query(
      'SELECT id, title, completion_percentage, total_weeks, status FROM roadmaps WHERE user_id = $1 AND is_current = true LIMIT 1',
      [userId]
    );

    // Completed tasks this week
    const weeklyTasks = await query(
      `SELECT COUNT(*) as total, SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed
       FROM roadmap_tasks WHERE user_id = $1 AND due_date >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );

    // Recent activity
    const recentActivity = await query(
      'SELECT activity_type, activity_title, xp_earned, created_at FROM progress WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    // Badges count
    const badgesCount = await query('SELECT COUNT(*) as count FROM user_badges WHERE user_id = $1', [userId]);

    // Notifications count
    const notifCount = await query('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false', [userId]);

    // Monthly progress
    const monthlyProgress = await query(
      `SELECT DATE_TRUNC('week', created_at) as week, COUNT(*) as activities, SUM(xp_earned) as xp
       FROM progress WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '4 weeks'
       GROUP BY 1 ORDER BY 1`,
      [userId]
    );

    // Project stats
    const projectStats = await query(
      `SELECT status, COUNT(*) as count FROM student_projects WHERE user_id = $1 GROUP BY status`,
      [userId]
    );

    const profile = profileResult.rows[0] || {};
    const roadmap = roadmapResult.rows[0];

    res.json({
      success: true,
      data: {
        profile,
        stats: {
          skillCount: parseInt(skillCount.rows[0]?.count) || 0,
          badgesCount: parseInt(badgesCount.rows[0]?.count) || 0,
          unreadNotifications: parseInt(notifCount.rows[0]?.count) || 0,
          careerReadinessScore: profile.career_readiness_score || 0,
          learningStreak: profile.learning_streak || 0,
          totalXp: profile.total_xp || 0,
        },
        roadmap: roadmap || null,
        weeklyProgress: {
          total: parseInt(weeklyTasks.rows[0]?.total) || 0,
          completed: parseInt(weeklyTasks.rows[0]?.completed) || 0,
        },
        recentActivity: recentActivity.rows,
        monthlyProgress: monthlyProgress.rows,
        projectStats: projectStats.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, getDashboard };
