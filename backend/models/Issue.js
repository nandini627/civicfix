const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  category: {
    type: String,
    enum: ['Pothole', 'Garbage', 'Street Light', 'Water Leak', 'Broken Sidewalk', 'Park Maintenance', 'Other'],
    default: 'Other',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Completed', 'Rejected'],
    default: 'Pending',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low',
  },
  replies: [
    {
      message: { type: String, required: true },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      senderRole: { type: String, default: 'admin' },
      imageUrl: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  officialResponse: {
    text: { type: String, default: '' },
    respondedAt: { type: Date },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    imageUrl: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Issue', issueSchema);
