const express = require('express');
const { getAllBadges, getStudentBadges } = require('../controllers/badgeController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllBadges);
router.get('/student', authenticate, getStudentBadges);

module.exports = router;
