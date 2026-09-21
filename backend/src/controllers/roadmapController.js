const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { generateRoadmap, generateWeeklyPlan } = require('../utils/aiService');

/**
 * POST /api/roadmaps/generate - AI Roadmap Generation
 */
const generateRoadmapHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { careerPathId } = req.body;

    // Get career path
    const cpResult = await query('SELECT * FROM career_paths WHERE id = $1 AND is_active = true', [careerPathId]);
    if (!cpResult.rows.length) throw new AppError('Career path not found.', 404);
    const careerPath = cpResult.rows[0];

    // Get student skills
    const skillsResult = await query(
      'SELECT s.name, s.category, ss.proficiency_level FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.user_id = $1',
      [userId]
    );

    // Get student profile
    const profileResult = await query('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);
    const profile = profileResult.rows[0];

    // Generate roadmap using AI service
    const roadmapData = generateRoadmap(careerPath, skillsResult.rows, profile);

    // Deactivate previous current roadmap
    await query('UPDATE roadmaps SET is_current = false WHERE user_id = $1 AND is_current = true', [userId]);

    // Save roadmap to DB
    const roadmapResult = await query(
      `INSERT INTO roadmaps (user_id, career_path_id, title, description, phases, total_weeks, is_current, status)
       VALUES ($1, $2, $3, $4, $5, $6, true, 'active')
       RETURNING *`,
      [userId, careerPathId, roadmapData.title, roadmapData.description, JSON.stringify(roadmapData.phases), roadmapData.totalWeeks]
    );
    const roadmap = roadmapResult.rows[0];

    // Save individual roadmap tasks
    const allTopics = roadmapData.phases.flatMap(phase =>
      (phase.topics || []).map(topic => ({
        roadmapId: roadmap.id,
        userId,
        phase: phase.phase,
        weekNumber: topic.week,
        title: topic.title,
        taskType: topic.type,
        tasks: topic.tasks,
        dueDate: new Date(Date.now() + (topic.week - 1) * 7 * 24 * 60 * 60 * 1000),
      }))
    );

    for (let i = 0; i < allTopics.length; i++) {
      const t = allTopics[i];
      await query(
        `INSERT INTO roadmap_tasks (roadmap_id, user_id, phase, week_number, title, task_type, due_date, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [t.roadmapId, t.userId, t.phase, t.weekNumber, t.title, t.taskType, t.dueDate, i]
      );
    }

    // Update career goal in profile
    await query('UPDATE student_profiles SET career_goal_id = $1 WHERE user_id = $2', [careerPathId, userId]);

    // Log activity & update readiness score
    await query(
      "INSERT INTO progress (user_id, activity_type, activity_title, xp_earned) VALUES ($1, 'roadmap_generated', $2, 150)",
      [userId, `Generated roadmap: ${roadmapData.title}`]
    );

    await query(
      'UPDATE student_profiles SET career_readiness_score = $1 WHERE user_id = $2',
      [roadmapData.skillGap.readinessScore, userId]
    );

    // Badge: Roadmap Pioneer
    const badge = await query("SELECT id FROM badges WHERE requirement_type = 'roadmaps_generated' LIMIT 1");
    if (badge.rows.length) {
      await query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, badge.rows[0].id]);
      await query(
        "INSERT INTO notifications (user_id, title, message, notification_type) VALUES ($1, '🏆 Badge Earned: Roadmap Pioneer!', 'You generated your first career roadmap. Keep going!', 'achievement')",
        [userId]
      );
    }

    // Notification
    await query(
      "INSERT INTO notifications (user_id, title, message, notification_type, action_url) VALUES ($1, '🗺️ Your roadmap is ready!', $2, 'success', '/roadmap')",
      [userId, `Your personalized ${careerPath.title} roadmap has been generated with ${roadmapData.totalWeeks} weeks of content.`]
    );

    res.status(201).json({
      success: true,
      message: 'Roadmap generated successfully!',
      data: { roadmap, roadmapData },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/roadmaps - Get all roadmaps for user
 */
const getRoadmaps = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, cp.title as career_path_title, cp.icon as career_path_icon
       FROM roadmaps r LEFT JOIN career_paths cp ON r.career_path_id = cp.id
       WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/roadmaps/current - Get current active roadmap
 */
const getCurrentRoadmap = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, cp.title as career_path_title, cp.icon as career_path_icon, cp.slug as career_path_slug
       FROM roadmaps r LEFT JOIN career_paths cp ON r.career_path_id = cp.id
       WHERE r.user_id = $1 AND r.is_current = true`,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.json({ success: true, data: null, message: 'No active roadmap found. Generate one!' });
    }

    // Get tasks for this roadmap
    const tasks = await query(
      'SELECT * FROM roadmap_tasks WHERE roadmap_id = $1 ORDER BY week_number, order_index',
      [result.rows[0].id]
    );

    res.json({ success: true, data: { ...result.rows[0], tasks: tasks.rows } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/roadmaps/:id - Get specific roadmap
 */
const getRoadmap = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, cp.title as career_path_title, cp.icon as career_path_icon
       FROM roadmaps r LEFT JOIN career_paths cp ON r.career_path_id = cp.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) throw new AppError('Roadmap not found.', 404);

    const tasks = await query('SELECT * FROM roadmap_tasks WHERE roadmap_id = $1 ORDER BY week_number, order_index', [req.params.id]);
    res.json({ success: true, data: { ...result.rows[0], tasks: tasks.rows } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/roadmaps/tasks/:taskId/complete - Mark task as complete
 */
const completeTask = async (req, res, next) => {
  try {
    const result = await query(
      'UPDATE roadmap_tasks SET is_completed = true, completed_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.taskId, req.user.id]
    );

    if (!result.rows.length) throw new AppError('Task not found.', 404);

    // Update roadmap completion percentage
    const stats = await query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as done FROM roadmap_tasks WHERE roadmap_id = $1',
      [result.rows[0].roadmap_id]
    );

    const pct = Math.round((stats.rows[0].done / stats.rows[0].total) * 100);
    await query('UPDATE roadmaps SET completion_percentage = $1 WHERE id = $2', [pct, result.rows[0].roadmap_id]);

    // Log progress
    await query(
      "INSERT INTO progress (user_id, activity_type, activity_title, xp_earned) VALUES ($1, 'task_completed', $2, 30)",
      [req.user.id, `Completed: ${result.rows[0].title}`]
    );

    // Update XP
    await query('UPDATE student_profiles SET total_xp = total_xp + 30, learning_streak = learning_streak + 1 WHERE user_id = $1', [req.user.id]);

    // First task badge
    const taskCount = await query("SELECT COUNT(*) as count FROM progress WHERE user_id = $1 AND activity_type = 'task_completed'", [req.user.id]);
    if (parseInt(taskCount.rows[0].count) === 1) {
      const badge = await query("SELECT id FROM badges WHERE requirement_type = 'tasks_completed' AND requirement_value = 1");
      if (badge.rows.length) {
        await query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, badge.rows[0].id]);
      }
    }

    res.json({ success: true, message: 'Task completed! +30 XP', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/roadmaps/:id - Delete roadmap
 */
const deleteRoadmap = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM roadmaps WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (!result.rows.length) throw new AppError('Roadmap not found.', 404);
    res.json({ success: true, message: 'Roadmap deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateRoadmapHandler, getRoadmaps, getCurrentRoadmap, getRoadmap, completeTask, deleteRoadmap };
