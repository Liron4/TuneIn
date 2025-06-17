const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/insideRoomControllers/ChatController');
const auth = require('../../middleware/auth');

// Send message to room chat
router.post('/:roomId/send', auth, chatController.sendMessage);

module.exports = router;