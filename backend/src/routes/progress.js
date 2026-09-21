const express = require('express');
const { getProgress, getActivity } = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', getProgress);
router.get('/activity', getActivity);

module.exports = router;
