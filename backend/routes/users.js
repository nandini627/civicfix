const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Issue = require('../models/Issue');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile and their reported issues
// @access  Private
router.get('/profile', auth, async (req, res) => {
  console.log('GET /api/users/profile called by:', req.user._id);
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const myIssues = await Issue.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email avatar');

    res.json({
      user,
      issues: myIssues,
      stats: {
        total: myIssues.length,
        resolved: myIssues.filter(i => i.status === 'Resolved').length,
        pending: myIssues.filter(i => i.status === 'Pending').length,
        inProgress: myIssues.filter(i => i.status === 'In Progress').length
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile (including avatar)
// @access  Private
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  console.log('PUT /api/users/profile called by:', req.user._id);
  try {
    const { name, email } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (req.file) updateData.avatar = `/${req.file.path.replace(/\\/g, '/')}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

module.exports = router;
