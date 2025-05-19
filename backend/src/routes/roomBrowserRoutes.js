const express = require('express');
const router = express.Router();
const multer = require('multer');
const roomController = require('../controllers/roomBrowserController');
const auth = require('../middleware/auth');

// Multer setup for image upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create room (requires authentication)
router.post('/', auth, upload.single('roomImage'), roomController.createRoom);

// Get all rooms (public endpoint but enhanced with auth)
router.get('/', auth, roomController.getRooms);

router.get('/:roomId', auth, roomController.getRoomById);




module.exports = router;