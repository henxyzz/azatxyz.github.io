// routes/articles.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Fungsi untuk mengambil artikel dari CNN Indonesia
const fetchArticles = async () => {
  try {
    const response = await axios.get('https://www.cnnindonesia.com');
    const $ = cheerio.load(response.data);
    const articles = [];

    // Mengambil semua artikel utama
    $('.container__list .list__headline').each((i, element) => {
      const title = $(element).find('a').text().trim();
      const link = $(element).find('a').attr('href');
      const image = $(element).find('img').attr('src');

      if (title && link && image) {
        articles.push({
          title,
          link: `https://www.cnnindonesia.com${link}`,
          image
        });
      }
    });

    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
};

// Rute untuk mendapatkan semua artikel
router.get('/', async (req, res) => {
  const articles = await fetchArticles();
  if (articles.length > 0) {
    res.json({
      status: 'success',
      data: articles
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Tidak dapat mengambil artikel'
    });
  }
});

// Rute untuk mendapatkan artikel berdasarkan ID
router.get('/:id', async (req, res) => {
  const articleId = req.params.id;
  const articles = await fetchArticles();

  const article = articles.find(a => a.link.includes(articleId));
  if (article) {
    res.json({
      status: 'success',
      data: article
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: 'Artikel tidak ditemukan'
    });
  }
});

module.exports = router;