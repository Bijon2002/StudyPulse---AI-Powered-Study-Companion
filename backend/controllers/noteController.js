const Note = require('../models/Note');

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
  try {
    const { title, content, subject, sources } = req.body;
    const newNote = new Note({
      user: req.user.id,
      title,
      content,
      subject,
      sources
    });
    const savedNote = await newNote.save();
    res.json(savedNote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
