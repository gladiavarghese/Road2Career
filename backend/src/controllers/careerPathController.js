const { query } = require('../config/db');

/**
 * GET /api/career-paths - List all career paths
 */
const getCareerPaths = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let where = 'WHERE is_active = true';
    const params = [];

    if (category) { params.push(category); where += ` AND category = $${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`; }

    const result = await query(`SELECT id, title, slug, description, icon, category, avg_salary, job_demand, required_skills FROM career_paths ${where} ORDER BY category, title`, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career-paths/:slug
 */
const getCareerPath = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM career_paths WHERE slug = $1 AND is_active = true', [req.params.slug]);
    if (!result.rows.length) {
      const { AppError } = require('../middleware/errorHandler');
      throw new AppError('Career path not found.', 404);
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: POST /api/career-paths
 */
const createCareerPath = async (req, res, next) => {
  try {
    const { title, slug, description, icon, category, avgSalary, jobDemand, requiredSkills } = req.body;
    const result = await query(
      'INSERT INTO career_paths (title, slug, description, icon, category, avg_salary, job_demand, required_skills) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, slug, description, icon, category, avgSalary, jobDemand, JSON.stringify(requiredSkills)]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: PUT /api/career-paths/:id
 */
const updateCareerPath = async (req, res, next) => {
  try {
    const { title, description, icon, category, avgSalary, jobDemand, requiredSkills, isActive } = req.body;
    const result = await query(
      'UPDATE career_paths SET title=$1, description=$2, icon=$3, category=$4, avg_salary=$5, job_demand=$6, required_skills=$7, is_active=$8 WHERE id=$9 RETURNING *',
      [title, description, icon, category, avgSalary, jobDemand, JSON.stringify(requiredSkills), isActive, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCareerPaths, getCareerPath, createCareerPath, updateCareerPath };
