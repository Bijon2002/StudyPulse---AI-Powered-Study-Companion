const express = require('express');
const router = express.Router();

// Mock in-memory storage for extension activity
let sessionStore = [];

router.get('/', (req, res) => {
  res.json({ sessions: sessionStore });
});

router.post('/', (req, res) => {
  const { sessions } = req.body;
  
  if (sessions && Array.isArray(sessions)) {
    console.log(`[Extension Analytics] Received ${sessions.length} recorded focus sessions.`);
    // Append to store
    sessionStore = [...sessions, ...sessionStore].slice(0, 50); // Keep last 50
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid sessions format' });
  }
});

module.exports = router;
