const express = require('express');
const axios = require('axios');
const router = express.Router();

// Endpoint untuk mendapatkan data TikTok berdasarkan username
router.get('/', async (req, res) => {
  const { username } = req.query;

  // Validasi parameter username
  if (!username) {
    return res.status(400).json({
      success: false,
      message: 'Silakan masukkan username TikTok.',
      usage: {
        endpoint: '/tiktokstalk',
        method: 'GET',
        query: { username: 'username_TikTok' },
      },
    });
  }

  try {
    // Mengambil data TikTok dari API eksternal
    const response = await axios.get(`https://api.rifandavinci.my.id/generate/tiktok?username=${username}`);

    const contentType = response.headers['content-type'];

    // Jika konten adalah gambar
    if (contentType && contentType.includes('image')) {
      const imageBuffer = response.data;

      return res.status(200).json({
        success: true,
        message: `Hasil Scrape TikTok untuk @${username}`,
        image: imageBuffer.toString('base64'),
      });
    } else {
      // Jika bukan gambar, coba parsing JSON
      const data = response.data;

      if (data && data.result && data.result.length > 0) {
        return res.json({
          success: true,
          message: `Hasil Scrape TikTok untuk @${username}`,
          images: data.result,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: `Maaf, tidak ada hasil yang ditemukan untuk @${username}.`,
        });
      }
    }
  } catch (error) {
    console.error('Error saat mengambil data TikTok:', error);
    return res.status(500).json({
      success: false,
      message: `Ups! Terjadi kesalahan saat mengambil data TikTok @${username}.`,
      error: error.message,
    });
  }
});

module.exports = router;