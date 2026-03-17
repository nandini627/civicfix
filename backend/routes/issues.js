const express = require('express');
const Issue = require('../models/Issue');
const { auth, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendStatusUpdateEmail } = require('../utils/email');

const router = express.Router();

// ─── POST /api/issues ──────────────────────────────────────────────────────────
// Report a new civic issue
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, category } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: 'Title, description, and location are required.' });
    }

    const newIssue = new Issue({
      title,
      description,
      location,
      category: category || 'Other',
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

// Get all civic issues (with pagination & filters)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const { status, unresponded, reportedBy, category, priority } = req.query;

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;
    if (reportedBy) query.reportedBy = reportedBy;
    if (unresponded === 'true') {
      query.$or = [
        { officialResponse: { $exists: false } },
        { 'officialResponse.text': '' }
      ];
    }

    const totalIssues = await Issue.countDocuments(query);
    const totalPages = Math.ceil(totalIssues / limit);

    // Get counts for dashboard stats (all issues, ignore filters for this part to show overview)
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      Pending: 0,
      'In Progress': 0,
      Resolved: 0,
      Rejected: 0
    };
    stats.forEach(s => {
      if (statusCounts.hasOwnProperty(s._id)) {
        statusCounts[s._id] = s.count;
      }
    });

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      issues,
      totalPages,
      currentPage: page,
      totalIssues,
      statusCounts
    });
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ message: 'Server error. Could not fetch issues.' });
  }
});

// ─── GET /api/issues/:id ──────────────────────────────────────────────────────
// Get a single civic issue by ID
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('reportedBy', 'name email');
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    res.status(200).json(issue);
  } catch (err) {
    console.error('Error fetching issue details:', err);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid issue ID.' });
    }
    res.status(500).json({ message: 'Server error. Could not fetch issue details.' });
  }
});

// ─── PUT /api/issues/:id/status ───────────────────────────────────────────────
// Update issue status (Admin only)
// ─── PUT /api/issues/:id/status ───────────────────────────────────────────────
// Update issue (Admin can update all, Reporter can update title/desc if pending)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { status, title, description, location, category, officialResponse, priority } = req.body;
    const { id } = req.params;

    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ message: 'Issue not found.' });

    const isAdmin = req.user.role === 'admin';
    const isReporter = issue.reportedBy.toString() === req.user._id.toString();

    // Permissions: Admins can update anything. Reporters can update title/description (if still pending).
    if (!isAdmin && !isReporter) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const updateData = {};
    if (status && isAdmin) updateData.status = status;
    if (priority && isAdmin) updateData.priority = priority;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (category) updateData.category = category;
    
    // Allow admin to update main issue image
    if (isAdmin && req.file && req.body.updateMainImage === 'true') {
      updateData.imageUrl = req.file.path;
    }
    
    // Official Response logic (Admin only)
    if (isAdmin && (officialResponse || (req.file && req.body.updateMainImage !== 'true') || status === 'Rejected')) {
      // Mandatory reason for rejection
      if (status === 'Rejected' && !officialResponse && (!issue.officialResponse || !issue.officialResponse.text)) {
        return res.status(400).json({ message: 'A reason is required when rejecting an issue.' });
      }

      const responseData = {
        respondedAt: new Date(),
        respondedBy: req.user._id
      };
      
      // If new text provided, update it. If not, keep old (if exists) or empty.
      responseData.text = officialResponse || (issue.officialResponse?.text || '');
      
      // If new photo provided, update it. If not, keep old (if exists).
      responseData.imageUrl = req.file ? req.file.path : (issue.officialResponse?.imageUrl || '');
      
      updateData.officialResponse = responseData;
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('reportedBy', 'name email').populate('officialResponse.respondedBy', 'name');

    if (status && isAdmin && updatedIssue.reportedBy?.email) {
      sendStatusUpdateEmail(
        updatedIssue.reportedBy.email,
        updatedIssue.reportedBy.name,
        updatedIssue.title,
        status
      );
    }

    res.status(200).json(updatedIssue);
  } catch (err) {
    console.error('Error updating issue:', err);
    res.status(500).json({ message: 'Server error. Could not update issue.' });
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
