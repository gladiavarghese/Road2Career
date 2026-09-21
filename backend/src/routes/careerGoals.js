const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  selectCareerGoal,
  getCurrentCareerGoal,
  clearCareerGoal,
} = require('../controllers/careerGoalController');

router.use(authenticate);

router.post('/select', selectCareerGoal);
router.get('/current', getCurrentCareerGoal);
router.delete('/current', clearCareerGoal);

module.exports = router;
