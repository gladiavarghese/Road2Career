const express = require('express');
const { getCareerPaths, getCareerPath, createCareerPath, updateCareerPath } = require('../controllers/careerPathController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCareerPaths);
router.get('/:slug', getCareerPath);
router.post('/', authenticate, requireAdmin, createCareerPath);
router.put('/:id', authenticate, requireAdmin, updateCareerPath);

module.exports = router;
