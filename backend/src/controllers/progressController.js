const { query } = require('../config/db');

/**
 * GET /api/progress - Student's progress overview
 */
const getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Overall activity stats
    const activityStats = await query(
      `SELECT activity_type, COUNT(*) as count, SUM(xp_earned) as total_xp
       FROM progress WHERE user_id = $1 GROUP BY activity_type`,
      [userId]
    );

    // Weekly progress for chart (last 12 weeks)
    const weeklyData = await query(
      `SELECT
        TO_CHAR(DATE_TRUNC('week', created_at), 'MM/DD') as week,
        COUNT(*) as activities,
        SUM(xp_earned) as xp
       FROM progress WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '12 weeks'
       GROUP BY 1 ORDER BY 1`,
      [userId]
    );

    // Daily streak data (last 30 days)
    const dailyData = await query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as activities
       FROM progress WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY 1 ORDER BY 1`,
      [userId]
    );

    // Roadmap completion
    const roadmapProgress = await query(
      `SELECT r.title, r.completion_percentage, r.total_weeks,
        COUNT(rt.id) as total_tasks,
        SUM(CASE WHEN rt.is_completed THEN 1 ELSE 0 END) as completed_tasks
       FROM roadmaps r LEFT JOIN roadmap_tasks rt ON r.id = rt.roadmap_id
       WHERE r.user_id = $1 AND r.is_current = true
       GROUP BY r.id`,
      [userId]
    );

    // Profile stats
    const profileStats = await query(
      'SELECT career_readiness_score, learning_streak, total_xp FROM student_profiles WHERE user_id = $1',
      [userId]
    );

    // Project completion stats
    const projectStats = await query(
      "SELECT status, COUNT(*) as count FROM student_projects WHERE user_id = $1 GROUP BY status",
      [userId]
    );

    // Badges earned
    const badges = await query(
      `SELECT b.*, ub.earned_at FROM user_badges ub JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1 ORDER BY ub.earned_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        activityStats: activityStats.rows,
        weeklyData: weeklyData.rows,
        dailyData: dailyData.rows,
        roadmapProgress: roadmapProgress.rows[0] || null,
        profileStats: profileStats.rows[0] || { career_readiness_score: 0, learning_streak: 0, total_xp: 0 },
        projectStats: projectStats.rows,
        badges: badges.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/progress/activity - Paginated activity log
 */
const getActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await query(
      `SELECT *, COUNT(*) OVER() as total_count FROM progress WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );

    const total = result.rows[0]?.total_count || 0;
    res.json({
      success: true,
      data: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(total) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProgress, getActivity };
