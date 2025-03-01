const express = require('express');
const { getLogs } = require('../controllers/logs');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), getLogs);

module.exports = router;
