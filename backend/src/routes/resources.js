const express = require('express');
const { getResources, getRecommended, getResource, createResource, updateResource, deleteResource } = require('../controllers/resourceController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getResources);
router.get('/recommended', authenticate, getRecommended);
router.get('/:id', getResource);

// Admin
router.post('/', authenticate, requireAdmin, createResource);
router.put('/:id', authenticate, requireAdmin, updateResource);
router.delete('/:id', authenticate, requireAdmin, deleteResource);

module.exports = router;
