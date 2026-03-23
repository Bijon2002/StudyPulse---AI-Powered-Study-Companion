const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  stats: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 }
  },
  profilePic: {
    type: String, // Base64 or URL
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
