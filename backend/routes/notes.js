const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');

// Get all notes for a user
router.get('/', auth, noteController.getNotes);

// Create a note
router.post('/', auth, noteController.createNote);

// Update a note
router.put('/:id', auth, noteController.updateNote);

// Delete a note
router.delete('/:id', auth, noteController.deleteNote);

module.exports = router;

module.exports = router;
