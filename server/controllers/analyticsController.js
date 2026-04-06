const Project = require('../models/Project');
const Note = require('../models/Note');
const File = require('../models/File');

// @desc    Get user analytics
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const projectCount = await Project.countDocuments({ owner: userId });
    const noteCount = await Note.countDocuments({ author: userId });
    const fileCount = await File.countDocuments({ uploader: userId });

    res.json({
      projects: projectCount,
      notes: noteCount,
      files: fileCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics };
