const express = require('express');
const router = express.Router();
const multer = require('multer');
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Multer setup for image upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create room (requires authentication)
router.post('/', auth, upload.single('roomImage'), roomController.createRoom);

// Get all rooms (public endpoint but enhanced with auth)
router.get('/', optionalAuth, roomController.getRooms);

// Optional auth middleware - doesn't require auth but processes token if present
function optionalAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Failed auth should not block, just continue without user info
    next();
  }
}

module.exports = router;