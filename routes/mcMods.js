const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi untuk mengambil daftar mod Minecraft secara acak
async function modsMinecraftRandom() {
  try {
    let randomPage = Math.floor(Math.random() * 120); // Pilih halaman acak
    const response = await axios.get(`https://tlauncher.org/en/mods_2/${randomPage}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Connection': 'keep-alive',
        'Referer': 'https://tlauncher.org/',
      },
    });

    const mods = [];
    const $ = cheerio.load(response.data);
    $('article.b-anons').each((i, element) => {
      const title = $(element).find('h2 a span').text();
      const link = $(element).find('h2 a').attr('href');
      const image = $(element).find('img').attr('src');
      const description = $(element).find('p').text().trim();

      mods.push({
        title,
        link: `https://tlauncher.org${link}`,
        image,
        description,
      });
    });

    return mods;
  } catch (error) {
    console.error(error);
    return { error: 'Terjadi kesalahan saat mengambil data' };
  }
}

// Fungsi untuk mengambil detail mod Minecraft
async function detailModsMinecraft(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Connection': 'keep-alive',
        'Referer': 'https://tlauncher.org/',
      },
    });

    const $ = cheerio.load(response.data);
    const result = [];

    result.title = $('h1').text();
    result.image = 'https://tlauncher.org' + $('img').first().attr('src');
    result.description = $('article.single-content').find('p').first().text().trim();
    result.downloadLink = $('a.b-button_modal').attr('href');

    return result;
  } catch (error) {
    console.error(error);
    return { error: 'Terjadi kesalahan saat mengambil detail mod' };
  }
}

// Fungsi untuk mendapatkan mod Minecraft terbaru
async function latestModsMinecraft() {
  try {
    const response = await axios.get('https://tlauncher.org/en/mods_2/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Connection': 'keep-alive',
        'Referer': 'https://tlauncher.org/',
      },
    });

    const mods = [];
    const $ = cheerio.load(response.data);
    $('article.b-anons').each((i, element) => {
      const title = $(element).find('h2 a span').text();
      const link = $(element).find('h2 a').attr('href');
      const image = $(element).find('img').attr('src');
      const description = $(element).find('p').text().trim();

      mods.push({
        title,
        link: `https://tlauncher.org${link}`,
        image,
        description,
      });
    });

    return mods;
  } catch (error) {
    console.error(error);
    return { error: 'Terjadi kesalahan saat mengambil data mod terbaru' };
  }
}

// Route untuk mendapatkan mod Minecraft acak
router.get('/random', async (req, res) => {
  const mods = await modsMinecraftRandom();
  if (mods.length > 0) {
    res.json({ status: 'success', mods });
  } else {
    res.status(500).json({ status: 'error', message: 'Tidak ada hasil' });
  }
});

// Route untuk mendapatkan detail mod Minecraft berdasarkan URL
router.get('/detail', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ status: 'error', message: 'URL mod tidak ditemukan' });
  }
  const modDetail = await detailModsMinecraft(url);
  if (modDetail.error) {
    res.status(500).json({ status: 'error', message: modDetail.error });
  } else {
    res.json({ status: 'success', mod: modDetail });
  }
});

// Route untuk mendapatkan mod Minecraft terbaru
router.get('/latest', async (req, res) => {
  const mods = await latestModsMinecraft();
  if (mods.length > 0) {
    res.json({ status: 'success', mods });
  } else {
    res.status(500).json({ status: 'error', message: 'Tidak ada hasil' });
  }
});

// Export routes
module.exports = router;