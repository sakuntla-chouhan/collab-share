const File = require('../models/File');
const Project = require('../models/Project');
const fs = require('fs');

// @desc    Upload file to project
// @route   POST /api/files/upload/:projectId
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Assuming user is authenticated and part of project
    const newFile = new File({
      name: req.file.originalname,
      path: `uploads/${req.file.filename}`,
      type: req.file.mimetype,
      size: req.file.size,
      project: project._id,
      uploader: req.user._id,
    });

    const file = await newFile.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project files
// @route   GET /api/files/project/:projectId
// @access  Private
const getProjectFiles = async (req, res) => {
  try {
    const files = await File.find({ project: req.params.projectId })
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    await file.deleteOne();
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { uploadFile, getProjectFiles, deleteFile };
