const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, deleteProject, addMember, removeMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

// Note: getProjectById handles its own public vs private checks inside, but we need protect if it's mostly private. 
// For public sharing logic, we may need a separate route or optional auth middleware. 
// For now, protecting it. We'll adjust auth logic as needed for public view.
router.route('/:id')
  .get(protect, getProjectById)
  .delete(protect, deleteProject);

router.route('/:id/members')
  .post(protect, addMember);

router.route('/:id/members/:memberId')
  .delete(protect, removeMember);

module.exports = router;
