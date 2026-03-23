const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Update Profile
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
