const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { analyzeSkillGap } = require('../utils/aiService');

/**
 * GET /api/skill-gap/analyze - Analyze skill gap for current career goal
 */
const analyzeGap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { careerPathId } = req.query;

    // Get career path
    const cpQuery = careerPathId
      ? 'SELECT * FROM career_paths WHERE id = $1'
      : 'SELECT cp.* FROM career_paths cp JOIN student_profiles sp ON sp.career_goal_id = cp.id WHERE sp.user_id = $1';

    const cpResult = await query(cpQuery, [careerPathId || userId]);
    if (!cpResult.rows.length) throw new AppError('Career path not set. Please select a career goal first.', 400);
    const careerPath = cpResult.rows[0];

    // Get student skills, profile & projects
    const skillsResult = await query(
      'SELECT s.name, s.category, s.slug, ss.proficiency_level, ss.years_experience FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.user_id = $1',
      [userId]
    );
    const profileResult = await query('SELECT learning_streak FROM student_profiles WHERE user_id = $1', [userId]);
    const projectsResult = await query('SELECT status FROM student_projects WHERE user_id = $1', [userId]);

    const analysis = analyzeSkillGap(careerPath, skillsResult.rows, profileResult.rows[0] || {}, projectsResult.rows);

    // Save assessment
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

    // Update readiness score in profile
    await query('UPDATE student_profiles SET career_readiness_score = $1 WHERE user_id = $2', [analysis.readinessScore, userId]);

    res.json({
      success: true,
      data: {
        careerPath: { id: careerPath.id, title: careerPath.title, slug: careerPath.slug },
        studentSkills: skillsResult.rows,
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/skill-gap/history - Skill assessment history
 */
const getHistory = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT sa.*, cp.title as career_path_title FROM skill_assessments sa
       LEFT JOIN career_paths cp ON sa.career_path_id = cp.id
       WHERE sa.user_id = $1 ORDER BY sa.created_at DESC LIMIT 10`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeGap, getHistory };
