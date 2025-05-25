const express = require('express');
const router = express.Router();
const queueController = require('../../controllers/insideRoomControllers/QueueController');
const auth = require('../../middleware/auth');

// Add song to room queue
router.post('/:roomId/add', auth, queueController.addSongToQueue);

// Get room queue
router.get('/:roomId', auth, queueController.getRoomQueue);

// Remove song from queue (by index)
router.delete('/:roomId/:songIndex', auth, queueController.removeSongFromQueue);

module.exports = router;