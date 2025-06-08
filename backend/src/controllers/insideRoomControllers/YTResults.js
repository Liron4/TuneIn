const axios = require('axios');

exports.searchYouTube = async (req, res) => {
  const q = req.query.q;
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!q) return res.status(400).json({ error: 'Missing search query' });

  try {
    // First get search results
    const searchResults = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        type: 'video',
        maxResults: 3,
        q,
        key: apiKey,
      },
    });
    
    // Get video IDs
    const videoIds = searchResults.data.items.map(item => item.id.videoId).join(',');
    
    // Get video details including duration
    if (videoIds) {
      const videoDetails = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'contentDetails,statistics',
          id: videoIds,
          key: apiKey,
        },
      });
      
      // Merge search results with video details
      const mergedResults = {
        ...searchResults.data,
        items: searchResults.data.items.map(item => {
          const details = videoDetails.data.items.find(
            detailItem => detailItem.id === item.id.videoId
          );
          
          return {
            ...item,
            contentDetails: details ? details.contentDetails : null,
            statistics: details ? details.statistics : null
          };
        })
      };
      
      res.json(mergedResults);
    } else {
      res.json(searchResults.data);
    }
  } catch (err) {
    console.error('YouTube API error:', err);
    res.status(500).json({ error: 'YouTube API error' });
  }
};

// Get video duration from YouTube
exports.getVideoDuration = async (videoId) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails',
        id: videoId,
        key: apiKey,
      },
    });
    
    if (response.data.items.length === 0) {
      return null;
    }
    
    // Parse ISO 8601 duration to seconds
    const duration = response.data.items[0].contentDetails.duration;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    const totalSeconds = 
      (hours ? parseInt(hours) * 3600 : 0) +
      (minutes ? parseInt(minutes) * 60 : 0) +
      (seconds ? parseInt(seconds) : 0);
      
    return totalSeconds;
  } catch (error) {
    console.error('Error fetching video duration:', error);
    return null;
  }
};