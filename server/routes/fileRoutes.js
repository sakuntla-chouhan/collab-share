const express = require('express');
const router = express.Router();
const { uploadFile, getProjectFiles, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

// Note: upload.single('file') handles the multipart form data extraction
router.route('/upload/:projectId').post(protect, upload.single('file'), uploadFile);
router.route('/project/:projectId').get(protect, getProjectFiles);
router.route('/:id').delete(protect, deleteFile);

module.exports = router;
