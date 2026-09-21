const express = require('express');
const { generateRoadmapHandler, getRoadmaps, getCurrentRoadmap, getRoadmap, completeTask, deleteRoadmap } = require('../controllers/roadmapController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(authenticate);

router.post('/generate', [body('careerPathId').notEmpty().withMessage('Career path ID is required')], validate, generateRoadmapHandler);
router.get('/', getRoadmaps);
router.get('/current', getCurrentRoadmap);
router.get('/:id', getRoadmap);
router.patch('/tasks/:taskId/complete', completeTask);
router.delete('/:id', deleteRoadmap);

module.exports = router;
