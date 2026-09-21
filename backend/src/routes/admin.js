const express = require('express');
const { getStats, getStudents, getStudent, toggleStudentStatus, createSkill, updateSkill } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getCareerPaths } = require('../controllers/careerPathController');
const { getAllSkills } = require('../controllers/skillController');
const { getResources } = require('../controllers/resourceController');
const { getProjects } = require('../controllers/projectController');

const router = express.Router();
router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/students', getStudents);
router.get('/students/:id', getStudent);
router.patch('/students/:id/toggle-status', toggleStudentStatus);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);

module.exports = router;
