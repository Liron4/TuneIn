const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  nickname: { type: String, required: true, unique: true },
  password: { type: String },
  genres: [{ type: String }],
  profilePic: { type: String, default: '/default-profile.png' },
  points: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);