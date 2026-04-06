const express = require('express');
const router = express.Router();
const { getProjectNotes, createNote, updateNote, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createNote);

router.route('/project/:projectId')
  .get(protect, getProjectNotes);

router.route('/:id')
  .put(protect, updateNote)
  .delete(protect, deleteNote);

module.exports = router;
