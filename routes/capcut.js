const express = require('express');
const axios = require('axios');
const md5 = require('crypto-js/md5');
const router = express.Router();

const BASE_URL = 'https://3bic.com';

router.get('/api/capcut', async (req, res) => {
  const link = req.query.url?.trim();

  if (!link || !/^https?:\/\/(?:www\.)?capcut\.com\/t\/[a-zA-Z0-9_-]+\/?$/.test(link)) {
    return res.status(400).json({ error: 'Link tidak valid! Harus berupa link CapCut template.' });
  }

  try {
    const time = Date.now().toString();
    const sign = md5(time + '12345678901234567890123456789012').toString();
    const kukis = `sign=${sign}; device-time=${time}`;

    const { data: { url } } = await axios.get(`${BASE_URL}/api/download/get-url`, {
      params: { url: link },
      headers: { Cookie: kukis },
    });

    const templateId = url.match(/template_id=(\d+)/)?.[1];
    if (!templateId) {
      return res.status(404).json({ error: 'Template ID tidak ditemukan!' });
    }

    const { data } = await axios.get(`${BASE_URL}/api/download/${templateId}`, {
      headers: { Cookie: kukis },
    });

    if (data.originalVideoUrl) {
      const videoUrl = `${BASE_URL}${data.originalVideoUrl}`;
      res.json({ success: true, videoUrl, message: 'Done ya bangg!!' });
    } else {
      res.status(404).json({ error: 'Gagal mendapatkan video.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan.' });
  }
});

module.exports = router;