const express = require('express');
const router = express.Router();
const YTResults = require('../../controllers/insideRoomControllers/YTResults');
const auth = require('../../middleware/auth');

router.get('/search', YTResults.searchYouTube);

// Add this route to get just the duration
router.get('/duration', auth, async (req, res) => {
  try {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: 'Missing video ID' });
    
    const duration = await YTResults.getVideoDuration(videoId);
    
    res.json({ duration });
  } catch (error) {
    console.error('Error fetching video duration:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;