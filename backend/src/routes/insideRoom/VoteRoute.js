const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const VoteController = require('../../controllers/insideRoomControllers/VoteController');

// Submit a vote
router.post('/:roomId/vote', auth, VoteController.handleVote);

// Get current voting status for a room
router.get('/:roomId/status', auth, VoteController.getVotingStatus);

module.exports = router;