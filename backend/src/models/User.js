const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  nickname: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  genres: [{ type: String }],
  profilePic: { type: String, default: '/default-profile.png' },
  points: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);