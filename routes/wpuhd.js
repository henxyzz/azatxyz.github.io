const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Endpoint pencarian wallpaper
router.get('/', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).send('Apa yang kamu ingin cari? Contoh: ?query=Naruto');
  }

  try {
    const wallpapers = await uhd(query);
    if (!wallpapers.length) {
      return res.status(404).send('Wallpaper tidak ditemukan!');
    }
    const randomImage = wallpapers[Math.floor(Math.random() * wallpapers.length)];
    res.json({
      image: randomImage.image,
      caption: 'Done 🎉',
    });
  } catch (e) {
    res.status(500).send('Terjadi kesalahan. Coba lagi nanti.');
  }
});

// Fungsi untuk mengambil wallpaper
async function uhd(query) {
  try {
    const response = await axios.get(`https://www.uhdpaper.com/search?q=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const wallpapers = [];

    $('.post-outer').each((i, element) => {
      let imgUrl = $(element).find('img').attr('src');
      if (imgUrl.startsWith('https://img.uhdpaper.com')) {
        wallpapers.push({ image: imgUrl });
      }
    });

    return wallpapers;
  } catch (e) {
    console.error(e);
    return [];
  }
}

module.exports = router;