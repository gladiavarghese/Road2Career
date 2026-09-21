const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/projects - Get projects with filtering
 */
const getProjects = async (req, res, next) => {
  try {
    const { difficulty = '', category = '', search = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = 'WHERE p.is_active = true';

    if (difficulty) { params.push(difficulty); where += ` AND p.difficulty = $${params.length}`; }
    if (category) { params.push(`%${category}%`); where += ` AND p.category ILIKE $${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`; }

    params.push(parseInt(limit), offset);

    const result = await query(
      `SELECT p.*, COUNT(*) OVER() as total_count FROM projects p
       ${where} ORDER BY p.difficulty, p.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = result.rows[0]?.total_count || 0;
    res.json({
      success: true,
      data: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(total), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/recommended - Recommended for student
 */
const getRecommended = async (req, res, next) => {
  try {
    const profileResult = await query(
      'SELECT cp.slug FROM student_profiles sp JOIN career_paths cp ON sp.career_goal_id = cp.id WHERE sp.user_id = $1',
      [req.user.id]
    );

    let projects;
    if (profileResult.rows.length) {
      const slug = profileResult.rows[0].slug;
      projects = await query(
        'SELECT * FROM projects WHERE is_active = true AND $1 = ANY(career_path_tags) ORDER BY difficulty LIMIT 8',
        [slug]
      );
    } else {
      projects = await query("SELECT * FROM projects WHERE is_active = true ORDER BY difficulty LIMIT 8");
    }

    res.json({ success: true, data: projects.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/student - Student's projects
 */
const getStudentProjects = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT sp.*, p.title, p.description, p.difficulty, p.technologies, p.estimated_duration, p.category
       FROM student_projects sp JOIN projects p ON sp.project_id = p.id
       WHERE sp.user_id = $1 ORDER BY sp.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/projects/student/start - Start a project
 */
const startProject = async (req, res, next) => {
  try {
    const { projectId } = req.body;
    const result = await query(
      `INSERT INTO student_projects (user_id, project_id, status, started_at)
       VALUES ($1, $2, 'in_progress', NOW())
       ON CONFLICT (user_id, project_id) DO UPDATE SET status = 'in_progress', started_at = NOW()
       RETURNING *`,
      [req.user.id, projectId]
    );
    res.status(201).json({ success: true, message: 'Project started!', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/projects/student/:id/complete - Complete a project
 */
const completeProject = async (req, res, next) => {
  try {
    const { githubUrl, demoUrl, notes } = req.body;
    const result = await query(
      `UPDATE student_projects SET status = 'completed', completed_at = NOW(), github_url = $1, demo_url = $2, notes = $3
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [githubUrl, demoUrl, notes, req.params.id, req.user.id]
    );

    if (!result.rows.length) throw new AppError('Project not found.', 404);

    await query(
      "INSERT INTO progress (user_id, activity_type, activity_title, xp_earned) VALUES ($1, 'project_completed', 'Completed a project', 300)",
      [req.user.id]
    );

    await query('UPDATE student_profiles SET total_xp = total_xp + 300 WHERE user_id = $1', [req.user.id]);

    // Project badge
    const pCount = await query("SELECT COUNT(*) as count FROM student_projects WHERE user_id = $1 AND status = 'completed'", [req.user.id]);
    if (parseInt(pCount.rows[0].count) >= 1) {
      const badge = await query("SELECT id FROM badges WHERE requirement_type = 'projects_completed' AND requirement_value = 1");
      if (badge.rows.length) {
        await query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, badge.rows[0].id]);
        await query(
          "INSERT INTO notifications (user_id, title, message, notification_type) VALUES ($1, '🏗️ Badge: Project Builder!', 'You completed your first project. Impressive!', 'achievement')",
          [req.user.id]
        );
      }
    }

    res.json({ success: true, message: 'Project completed! +300 XP 🎉', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id - Get detailed project specs
 */
const getProjectById = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM projects WHERE id = $1 AND is_active = true', [req.params.id]);
    if (!result.rows.length) throw new AppError('Project not found.', 404);

    const project = result.rows[0];

    // Build rich details if not present
    const features = project.features || [
      'Implement user authentication and role management',
      'Build responsive, interactive UI dashboard',
      'Create CRUD database operations with relationships',
      'Set up error handling, logging, and input validation',
      'Deploy application to cloud hosting environment'
    ];

    const architectureSteps = project.architecture_steps || [
      'Phase 1: Project Setup & Database Schema Design',
      'Phase 2: RESTful API Endpoint Development',
      'Phase 3: Frontend Component Integration & State Management',
      'Phase 4: End-to-End Testing & Bug Fixing',
      'Phase 5: Cloud Deployment & Portfolio Documentation'
    ];

    res.json({
      success: true,
      data: {
        ...project,
        features,
        architectureSteps,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, getRecommended, getStudentProjects, getProjectById, startProject, completeProject };
