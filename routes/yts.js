const express = require('express');
const axios = require('axios');
const yts = require('yt-search');
const router = express.Router();

// Endpoint pencarian video YouTube
router.get('/', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const searchResults = await yts(query);
    const videos = searchResults.videos.map((video) => ({
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.timestamp,
      views: video.views,
      author: video.author.name,
    }));
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;