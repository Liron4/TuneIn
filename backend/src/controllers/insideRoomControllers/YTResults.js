const axios = require('axios');

exports.searchYouTube = async (req, res) => {
  const q = req.query.q;
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!q) return res.status(400).json({ error: 'Missing search query' });

  try {
    const ytRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        type: 'video',
        maxResults: 3,
        q,
        key: apiKey,
      },
    });
    res.json(ytRes.data);
  } catch (err) {
    res.status(500).json({ error: 'YouTube API error' });
  }
};