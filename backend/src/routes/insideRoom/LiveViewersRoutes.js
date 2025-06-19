const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const LiveViewersController = require('../../controllers/insideRoomControllers/ViewersControllers/LiveViewersController');

// Get live viewers count and skip status
router.get('/:roomId', auth, LiveViewersController.getLiveViewers);

// Handle skip vote
router.post('/:roomId/vote-skip', auth, LiveViewersController.handleSkipVote);

module.exports = router;