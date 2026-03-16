const express = require('express');
const Issue = require('../models/Issue');
const { auth, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// ─── POST /api/issues ──────────────────────────────────────────────────────────
// Report a new civic issue
router.post('/', auth, upload.single('image'), async (req, res) => {
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
      imageUrl: req.file ? req.file.path : '',
    });

    const savedIssue = await newIssue.save();
    res.status(201).json(savedIssue);
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ message: 'Server error. Could not report issue.' });
  }
});

// ─── GET /api/issues ───────────────────────────────────────────────────────────
// Get all civic issues (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const totalIssues = await Issue.countDocuments();
    const totalPages = Math.ceil(totalIssues / limit);

    const issues = await Issue.find()
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      issues,
      totalPages,
      currentPage: page,
      totalIssues
    });
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ message: 'Server error. Could not fetch issues.' });
  }
});

// ─── PUT /api/issues/:id/status ───────────────────────────────────────────────
// Update issue status (Admin only)
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

// ─── DELETE /api/issues/:id ──────────────────────────────────────────────────
// Delete a civic issue (Admin OR original reporter only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    // Check permissions: Admin can delete any issue, Citizens can delete only their own
    const isReporter = issue.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isReporter) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own reports.' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Issue deleted successfully.' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    res.status(500).json({ message: 'Server error. Could not delete issue.' });
  }
});

module.exports = router;
