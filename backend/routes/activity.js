const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { sessions } = req.body;
  
  if (sessions && Array.isArray(sessions)) {
    console.log(`[Extension Analytics] Received ${sessions.length} recorded focus sessions.`);
    // Here you would optimally save this to the User's Focus analytics MongoDB table
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid sessions format' });
  }
});

module.exports = router;
