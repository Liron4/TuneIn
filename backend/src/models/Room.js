const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  genres: [{ 
    type: String 
  }],
  image: { 
    type: String, 
    required: true 
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isHidden: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  songqueue: {
  type: [mongoose.Schema.Types.Mixed], // array of Mixed types
  default: [] 
  },

  capacity: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Room', roomSchema);