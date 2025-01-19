const express = require('express');
const axios = require('axios');
const router = express.Router();

const BASE_URL = 'https://brat.caliphdev.com/api/brat';

// Endpoint Brat API
router.get('/', async (req, res) => {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: 'Parameter "text" diperlukan!' });
  }

  if (text.length > 250) {
    return res.status(400).json({ error: 'Teks terlalu panjang, maksimal 250 karakter!' });
  }

  try {
    const response = await axios.get(`${BASE_URL}?text=${encodeURIComponent(text)}`, {
      responseType: 'arraybuffer',
    });

    if (response.status === 200) {
      res.json({
        success: true,
        message: 'Video berhasil dibuat!',
        video: response.data.toString('base64'), // Video dalam format base64
      });
    } else {
      res.status(response.status).json({ error: 'Gagal memproses permintaan ke API Brat' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan' });
  }
});

module.exports = router;
