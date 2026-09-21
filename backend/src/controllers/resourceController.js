const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/resources - Get resources with filtering/pagination
 */
const getResources = async (req, res, next) => {
  try {
    const { type = '', difficulty = '', category = '', search = '', page = 1, limit = 20, free } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = 'WHERE lr.is_active = true';

    if (type) { params.push(type); where += ` AND lr.resource_type = $${params.length}`; }
    if (difficulty) { params.push(difficulty); where += ` AND lr.difficulty = $${params.length}`; }
    if (category) { params.push(`%${category}%`); where += ` AND lr.category ILIKE $${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND (lr.title ILIKE $${params.length} OR lr.description ILIKE $${params.length})`; }
    if (free !== undefined) { params.push(free === 'true'); where += ` AND lr.is_free = $${params.length}`; }

    params.push(parseInt(limit), offset);
    const result = await query(
      `SELECT lr.*, COUNT(*) OVER() as total_count FROM learning_resources lr
       ${where} ORDER BY lr.rating DESC, lr.created_at DESC
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
 * GET /api/resources/recommended - Resources for student's career goal
 */
const getRecommended = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get student's career goal and skills
    const profileResult = await query(
      'SELECT cp.slug, cp.required_skills FROM student_profiles sp JOIN career_paths cp ON sp.career_goal_id = cp.id WHERE sp.user_id = $1',
      [userId]
    );

    const studentSkillsRes = await query(
      'SELECT s.name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.user_id = $1',
      [userId]
    );

    const studentSkillNames = (studentSkillsRes.rows || []).map(s => s.name.toLowerCase());

    let resources;
    if (profileResult.rows.length) {
      const { slug: careerSlug, required_skills: requiredSkills = [] } = profileResult.rows[0];
      const missingSkills = (requiredSkills || []).filter(rs => !studentSkillNames.includes(rs.toLowerCase()));

      resources = await query(
        `SELECT lr.*,
          CASE WHEN $1 = ANY(lr.career_path_tags) THEN true ELSE false END as is_career_match,
          CASE WHEN lr.category ILIKE ANY($2::text[]) THEN true ELSE false END as is_skill_gap_match
         FROM learning_resources lr
         WHERE lr.is_active = true AND ($1 = ANY(lr.career_path_tags) OR lr.career_path_tags IS NULL OR lr.category ILIKE ANY($2::text[]))
         ORDER BY is_skill_gap_match DESC, is_career_match DESC, lr.rating DESC LIMIT 12`,
        [careerSlug, missingSkills.length ? missingSkills : ['%']]
      );
    } else {
      resources = await query('SELECT *, false as is_career_match, false as is_skill_gap_match FROM learning_resources WHERE is_active = true ORDER BY rating DESC LIMIT 12');
    }

    res.json({ success: true, data: resources.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resources/:id - Get single resource
 */
const getResource = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM learning_resources WHERE id = $1 AND is_active = true', [req.params.id]);
    if (!result.rows.length) throw new AppError('Resource not found.', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: POST /api/resources - Create resource
 */
const createResource = async (req, res, next) => {
  try {
    const { title, description, url, resourceType, category, skillTags, careerPathTags, difficulty, duration, isFree, rating } = req.body;
    const result = await query(
      `INSERT INTO learning_resources (title, description, url, resource_type, category, skill_tags, career_path_tags, difficulty, duration, is_free, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title, description, url, resourceType, category, skillTags, careerPathTags, difficulty, duration, isFree, rating]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: PUT /api/resources/:id - Update resource
 */
const updateResource = async (req, res, next) => {
  try {
    const { title, description, url, resourceType, category, difficulty, duration, isFree, rating, isActive } = req.body;
    const result = await query(
      `UPDATE learning_resources SET title=$1, description=$2, url=$3, resource_type=$4, category=$5, difficulty=$6, duration=$7, is_free=$8, rating=$9, is_active=$10
       WHERE id = $11 RETURNING *`,
      [title, description, url, resourceType, category, difficulty, duration, isFree, rating, isActive, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Resource not found.', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: DELETE /api/resources/:id - Delete resource
 */
const deleteResource = async (req, res, next) => {
  try {
    await query('UPDATE learning_resources SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Resource deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getResources, getRecommended, getResource, createResource, updateResource, deleteResource };
