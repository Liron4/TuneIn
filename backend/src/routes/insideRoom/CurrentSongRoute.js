const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const CurrentSongController = require('../../controllers/insideRoomControllers/CurrentSongController');

// Get current song for a room
router.get('/:roomId', auth, CurrentSongController.getCurrentSong);

// Skip current song
router.post('/:roomId/skip', auth, CurrentSongController.skipSong);

module.exports = router;