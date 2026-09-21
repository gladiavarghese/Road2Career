const express = require('express');
const { analyzeGap, getHistory } = require('../controllers/skillGapController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/analyze', analyzeGap);
router.get('/history', getHistory);

module.exports = router;
