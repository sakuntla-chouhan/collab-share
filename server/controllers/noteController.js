const Note = require('../models/Note');
const Project = require('../models/Project');

// @desc    Get all notes for a project
// @route   GET /api/notes/project/:projectId
// @access  Private
const getProjectNotes = async (req, res) => {
  try {
    const notes = await Note.find({ project: req.params.projectId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { title, content, project } = req.body;
    
    // Authorization check
    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (existingProject.owner.toString() !== req.user._id.toString() && !existingProject.members.includes(req.user._id)) {
        return res.status(401).json({ message: 'Not authorized for this project' });
    }

    const note = new Note({
      title,
      content,
      project,
      author: req.user._id,
    });

    const createdNote = await note.save();
    res.status(201).json(createdNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Since we are validating user project membership, simpler just to verify author for now, or team access.
    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjectNotes, createNote, updateNote, deleteNote };
