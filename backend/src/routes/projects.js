const express = require('express');
const { getProjects, getRecommended, getStudentProjects, getProjectById, startProject, completeProject } = require('../controllers/projectController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProjects);
router.get('/recommended', authenticate, getRecommended);
router.get('/student', authenticate, getStudentProjects);
router.get('/:id', getProjectById);
router.post('/student/start', authenticate, startProject);
router.patch('/student/:id/complete', authenticate, completeProject);

module.exports = router;
