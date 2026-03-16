const express = require('express');
const Issue = require('../models/Issue');
const { auth, admin } = require('../middleware/auth');

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
      reportedBy: req.user._id,
    });

    const savedIssue = await newIssue.save();
    res.status(201).json(savedIssue);
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ message: 'Server error. Could not report issue.' });
  }
});

// ─── GET /api/issues ───────────────────────────────────────────────────────────
// Get all civic issues
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ message: 'Server error. Could not fetch issues.' });
  }
});

// ─── PUT /api/issues/:id/status ───────────────────────────────────────────────
// Update issue status (Admin only)
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('reportedBy', 'name');

    if (!updatedIssue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    res.status(200).json(updatedIssue);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Server error. Could not update status.' });
  }
});

module.exports = router;
