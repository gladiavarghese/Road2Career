const { query } = require('../config/db');

/**
 * GET /api/admin/stats - Dashboard overview stats
 */
const getStats = async (req, res, next) => {
  try {
    const [students, activeStudents, careerPaths, skills, resources, projects, roadmaps] = await Promise.all([
      query("SELECT COUNT(*) as count FROM users WHERE role = 'student'"),
      query("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND last_login > NOW() - INTERVAL '30 days'"),
      query('SELECT COUNT(*) as count FROM career_paths WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM skills WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM learning_resources WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM projects WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM roadmaps'),
    ]);

    // Student growth (last 6 months)
    const studentGrowth = await query(
      `SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month, COUNT(*) as count
       FROM users WHERE role = 'student' AND created_at >= NOW() - INTERVAL '6 months'
       GROUP BY 1, DATE_TRUNC('month', created_at) ORDER BY DATE_TRUNC('month', created_at)`
    );

    // Popular careers
    const popularCareers = await query(
      `SELECT cp.title, cp.icon, COUNT(sp.id) as student_count
       FROM career_paths cp LEFT JOIN student_profiles sp ON cp.id = sp.career_goal_id
       GROUP BY cp.id ORDER BY student_count DESC LIMIT 5`
    );

    // Popular skills
    const popularSkills = await query(
      `SELECT s.name, s.category, COUNT(ss.id) as student_count
       FROM skills s LEFT JOIN student_skills ss ON s.id = ss.skill_id
       GROUP BY s.id ORDER BY student_count DESC LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents: parseInt(students.rows[0].count),
          activeStudents: parseInt(activeStudents.rows[0].count),
          careerPaths: parseInt(careerPaths.rows[0].count),
          skills: parseInt(skills.rows[0].count),
          resources: parseInt(resources.rows[0].count),
          projects: parseInt(projects.rows[0].count),
          totalRoadmaps: parseInt(roadmaps.rows[0].count),
        },
        studentGrowth: studentGrowth.rows,
        popularCareers: popularCareers.rows,
        popularSkills: popularSkills.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/students - List all students with filtering
 */
const getStudents = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = "WHERE u.role = 'student'";

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (u.email ILIKE $${params.length} OR sp.first_name ILIKE $${params.length} OR sp.last_name ILIKE $${params.length})`;
    }
    if (status === 'active') where += " AND u.is_active = true";
    if (status === 'inactive') where += " AND u.is_active = false";

    params.push(parseInt(limit), offset);

    const result = await query(
      `SELECT u.id, u.email, u.is_active, u.created_at, u.last_login,
       sp.first_name, sp.last_name, sp.avatar_url, sp.college, sp.career_readiness_score, sp.total_xp,
       cp.title as career_goal, COUNT(*) OVER() as total_count
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN career_paths cp ON sp.career_goal_id = cp.id
       ${where} ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = result.rows[0]?.total_count || 0;
    res.json({
      success: true,
      data: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(total), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/students/:id - Get student details
 */
const getStudent = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.*, sp.*, cp.title as career_goal_title
       FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN career_paths cp ON sp.career_goal_id = cp.id
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const skills = await query(
      'SELECT s.name, s.category, ss.proficiency_level FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.user_id = $1',
      [req.params.id]
    );

    const progress = await query(
      "SELECT COUNT(*) as total_activities, SUM(xp_earned) as total_xp FROM progress WHERE user_id = $1",
      [req.params.id]
    );

    res.json({ success: true, data: { ...result.rows[0], skills: skills.rows, progressStats: progress.rows[0] } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/students/:id/toggle-status
 */
const toggleStudentStatus = async (req, res, next) => {
  try {
    const result = await query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, email, is_active',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create skill
 */
const createSkill = async (req, res, next) => {
  try {
    const { name, slug, category, description, icon } = req.body;
    const result = await query(
      'INSERT INTO skills (name, slug, category, description, icon) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, slug || name.toLowerCase().replace(/\s+/g, '-'), category, description, icon]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update skill
 */
const updateSkill = async (req, res, next) => {
  try {
    const { name, category, description, icon, isActive } = req.body;
    const result = await query(
      'UPDATE skills SET name=$1, category=$2, description=$3, icon=$4, is_active=$5 WHERE id=$6 RETURNING *',
      [name, category, description, icon, isActive, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getStudents, getStudent, toggleStudentStatus, createSkill, updateSkill };
