const express = require('express');
const router = express.Router();
const { searchYouTube } = require('../../controllers/insideRoomControllers/YTResults');

router.get('/search', searchYouTube);

module.exports = router;