const Project = require('../models/Project');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const project = new Project({
      name,
      description,
      isPublic: isPublic || false,
      owner: req.user._id,
      members: [req.user._id],
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    }).populate('owner', 'name email').sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private (or Public if isPublic is true)
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Access control
    if (!project.isPublic && project.owner.toString() !== req.user._id.toString() && !project.members.some(member => member._id.toString() === req.user._id.toString())) {
       return res.status(401).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Only owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Find user by email
    const User = require('../models/User');
    const userToAdd = await User.findOne({ email });
    
    if (!userToAdd) {
      // Simulate/Send invite to non-registered user
      try {
        await sendEmail({
          email,
          subject: `Invitation: Join ${project.name} on CollabSphere`,
          message: `Hello,\n\nYou have been invited by ${req.user.name} to join the project "${project.name}" on CollabSphere.\n\nPlease sign up or log in at http://localhost:5173/ to start collaborating!`
        });
      } catch (err) {
        console.error(`Non-blocking email failure: ${err.message}`);
      }
      return res.status(200).json({ message: 'User not found in system, but an invitation has been recorded!' });
    }
    
    if (project.members.some(m => m.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(userToAdd._id);
    await project.save();
    
    // Notify registered user
    try {
      await sendEmail({
        email,
        subject: `You've been added to ${project.name} on CollabSphere!`,
        message: `Hello ${userToAdd.name},\n\nYou have been added to the project "${project.name}" by ${req.user.name}.\n\nLog in to start collaborating at http://localhost:5173/ !`
      });
    } catch (err) {
      console.error(`Non-blocking email failure: ${err.message}`);
    }

    const updatedProject = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
      
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:memberId
// @access  Private
const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const project = await Project.findById(id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Only owner can remove members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    project.members = project.members.filter(m => m.toString() !== memberId);
    await project.save();
    
    const updatedProject = await Project.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
      
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, deleteProject, addMember, removeMember };
