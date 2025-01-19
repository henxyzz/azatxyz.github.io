const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Konstanta URL dan cookies
const BASE_URL = "https://m.apksum.com/search?q=";
const COOKIES = {
  PHPSESSID: "tho2f92d6gqf2bq8j2tqojf5d9",
  _ga: "GA1.1.867180231.1736720071",
  // Tambahkan cookies lainnya jika diperlukan
};

// Fungsi untuk mengonversi cookies menjadi string
const getCookieString = (cookies) => {
  return Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join("; ");
};

// Endpoint untuk pencarian aplikasi
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Parameter "query" diperlukan!' });
  }

  try {
    const cookieString = getCookieString(COOKIES);
    const searchUrl = BASE_URL + encodeURIComponent(query);

    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
        "Cookie": cookieString,
      },
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('div.box ul#pagedata li a').each((_, element) => {
      const href = $(element).attr('href');
      const title = $(element).attr('title');

      if (href && title) {
        results.push({
          name: title.trim(),
          url: `https://m.apksum.com${href.trim()}`,
        });
      }
    });

    res.json({ success: true, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memproses permintaan pencarian.' });
  }
});

// Endpoint untuk mendapatkan tautan unduhan
router.get('/download-links', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Parameter "url" diperlukan!' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const downloadLinks = [];

    $('div.down-warp .down a').each((_, element) => {
      const downloadUrl = $(element).attr('href');
      const downloadTitle = $(element).attr('title');

      if (downloadUrl && downloadTitle) {
        downloadLinks.push({
          name: downloadTitle.trim(),
          url: `https://m.apksum.com${downloadUrl.trim()}`,
        });
      }
    });

    res.json({ success: true, downloadLinks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mendapatkan tautan unduhan.' });
  }
});

module.exports = router;
