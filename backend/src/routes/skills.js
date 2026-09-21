const express = require('express');
const {
  getAllSkills,
  getCategories,
  getStudentSkills,
  addStudentSkill,
  updateStudentSkill,
  removeStudentSkill,
  submitSkillAssessment,
  getAssessmentHistory,
  getSkillQuiz,
} = require('../controllers/skillController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', getAllSkills);
router.get('/categories', getCategories);

// Protected
router.use(authenticate);
router.get('/student', getStudentSkills);
router.post('/student', addStudentSkill);
router.put('/student/:id', updateStudentSkill);
router.delete('/student/:id', removeStudentSkill);

// Skill Assessment module routes
router.post('/assess', submitSkillAssessment);
router.get('/assessments', getAssessmentHistory);
router.get('/quiz/:skillId', getSkillQuiz);

module.exports = router;
