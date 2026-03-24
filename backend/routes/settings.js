const express = require('express');
const router = express.Router();

// Simple in-memory storage for extension data (Demo purposes)
// In a full app with auth synced to extension, this would associate to a User DB model
let globalAllowlist = ["leetcode.com", "coursera.org", "react.dev", "developer.mozilla.org", "youtube.com"];

router.get('/allowlist', (req, res) => {
  res.json({ allowlist: globalAllowlist });
});

router.post('/allowlist', (req, res) => {
  const { allowlist } = req.body;
  if (Array.isArray(allowlist)) {
    globalAllowlist = allowlist;
    res.json({ success: true, allowlist: globalAllowlist });
  } else {
    res.status(400).json({ error: 'Invalid allowlist format' });
  }
});

module.exports = router;
