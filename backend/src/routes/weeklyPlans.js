const express = require('express');
const { generatePlan, getPlans, getCurrentPlan, completeTask } = require('../controllers/weeklyPlanController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.post('/generate', generatePlan);
router.get('/', getPlans);
router.get('/current', getCurrentPlan);
router.patch('/:id/complete-task', completeTask);

module.exports = router;
