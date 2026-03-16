const express = require('express');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/issues ──────────────────────────────────────────────────────────
// Report a new civic issue
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, location } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: 'Title, description, and location are required.' });
    }

    const newIssue = new Issue({
      title,
      description,
      location,
      reportedBy: req.user,
    });

    const savedIssue = await newIssue.save();
    res.status(201).json(savedIssue);
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ message: 'Server error. Could not report issue.' });
  }
});

module.exports = router;
