const express = require('express');
const router = express.Router();
const { processWithAI } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/process', protect, processWithAI);

module.exports = router;
