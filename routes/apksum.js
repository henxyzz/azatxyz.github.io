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

// Endpoint tunggal /api/apksum dengan mode
router.get('/', async (req, res) => {
  const { mode, query, url, author = 'Azatxyz' } = req.query; // Mengambil mode, query, url, dan author dari parameter query string

  // Validasi parameter mode dan query/url
  if (!mode || (mode !== 'search' && mode !== 'download')) {
    return res.status(400).json({ error: 'Parameter "mode" diperlukan dan harus bernilai "search" atau "download".' });
  }

  if (mode === 'search' && !query) {
    return res.status(400).json({ error: 'Parameter "query" diperlukan untuk pencarian aplikasi.' });
  }

  if (mode === 'download' && !url) {
    return res.status(400).json({ error: 'Parameter "url" diperlukan untuk mendapatkan tautan unduhan.' });
  }

  try {
    // Jika mode = search, lakukan pencarian aplikasi
    if (mode === 'search' && query) {
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

      return res.json({
        success: true,
        results,
        author, // Menambahkan author ke dalam response
      });
    }

    // Jika mode = download, lakukan pengambilan tautan unduhan
    if (mode === 'download' && url) {
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

      return res.json({
        success: true,
        downloadLinks,
        author, // Menambahkan author ke dalam response
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan.' });
  }
});

module.exports = router;