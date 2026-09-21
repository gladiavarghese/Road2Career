const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { analyzeSkillGap } = require('../utils/aiService');

/**
 * POST /api/career-goals/select
 * Set active career goal for current student
 */
const selectCareerGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { careerPathId } = req.body;

    if (!careerPathId) {
      throw new AppError('careerPathId is required.', 400);
    }

    // Check career path exists
    const cpResult = await query('SELECT * FROM career_paths WHERE id = $1 AND is_active = true', [careerPathId]);
    if (!cpResult.rows.length) {
      throw new AppError('Career path not found or inactive.', 404);
    }
    const careerPath = cpResult.rows[0];

    // Update profile
    await query('UPDATE student_profiles SET career_goal_id = $1 WHERE user_id = $2', [careerPathId, userId]);

    // Recalculate skill gap & readiness score
    const skillsResult = await query(
      'SELECT s.name, s.category, s.slug, ss.proficiency_level, ss.years_experience FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.user_id = $1',
      [userId]
    );
    const profileResult = await query('SELECT learning_streak FROM student_profiles WHERE user_id = $1', [userId]);
    const projectsResult = await query('SELECT status FROM student_projects WHERE user_id = $1', [userId]);

    const analysis = analyzeSkillGap(careerPath, skillsResult.rows, profileResult.rows[0] || {}, projectsResult.rows);

    // Save assessment record
    await query(
      `INSERT INTO skill_assessments (user_id, career_path_id, assessment_data, missing_skills, strong_skills, improvement_areas, readiness_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        careerPath.id,
        JSON.stringify({ 
          studentSkills: skillsResult.rows, 
          careerPath: careerPath.title,
          scoreBreakdown: analysis.scoreBreakdown
        }),
        JSON.stringify(analysis.missingSkills),
        JSON.stringify(analysis.strengths),
        JSON.stringify(analysis.improvementSuggestions),
        analysis.readinessScore,
      ]
    );

    // Update readiness score in profile & add XP
    await query(
      'UPDATE student_profiles SET career_readiness_score = $1, total_xp = total_xp + 50 WHERE user_id = $2',
      [analysis.readinessScore, userId]
    );

    // Log progress activity
    await query(
      `INSERT INTO progress (user_id, activity_type, activity_title, activity_data, xp_earned)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'badge_earned', `Set Career Goal: ${careerPath.title}`, JSON.stringify({ careerPathId }), 50]
    );

    // Create notification
    await query(
      `INSERT INTO notifications (user_id, title, message, notification_type, action_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        'Career Goal Selected! 🎯',
        `Your active career goal is now set to ${careerPath.title}. Check your AI Roadmap and Skill Gap analysis.`,
        'achievement',
        '/roadmap',
      ]
    );

    res.json({
      success: true,
      message: `Career goal updated to ${careerPath.title}`,
      data: {
        careerGoal: careerPath,
        readinessScore: analysis.readinessScore,
        scoreBreakdown: analysis.scoreBreakdown,
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-goals/current
 * Fetch student's currently active career goal with metrics
 */
const getCurrentCareerGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT cp.*, sp.career_readiness_score, sp.learning_streak, sp.updated_at as goal_set_at
       FROM student_profiles sp
       JOIN career_paths cp ON sp.career_goal_id = cp.id
       WHERE sp.user_id = $1`,
      [userId]
    );

    if (!result.rows.length) {
      return res.json({ success: true, data: null });
    }

    const careerPath = result.rows[0];

    // Fetch skills
    const skillsResult = await query(
      'SELECT s.name, s.category, ss.proficiency_level FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.user_id = $1',
      [userId]
    );
    const projectsResult = await query('SELECT status FROM student_projects WHERE user_id = $1', [userId]);

    const analysis = analyzeSkillGap(careerPath, skillsResult.rows, { learning_streak: careerPath.learning_streak }, projectsResult.rows);

    res.json({
      success: true,
      data: {
        careerGoal: careerPath,
        readinessScore: analysis.readinessScore,
        scoreBreakdown: analysis.scoreBreakdown,
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/career-goals/current
 * Clear active career goal
 */
const clearCareerGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await query('UPDATE student_profiles SET career_goal_id = NULL WHERE user_id = $1', [userId]);
    res.json({ success: true, message: 'Career goal cleared successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  selectCareerGoal,
  getCurrentCareerGoal,
  clearCareerGoal,
};
