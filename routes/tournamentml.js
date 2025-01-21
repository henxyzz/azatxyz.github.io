const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Endpoint untuk mendapatkan daftar turnamen
router.get('/', async (req, res) => {
  try {
    const { data } = await axios.get('https://infotourney.com/tournament/mobile-legends');
    const $ = cheerio.load(data);
    const tournaments = [];

    $('.items-row .item').each((_, element) => {
      const title = $(element).find('h2 a').text().trim();
      const url = "https://infotourney.com" + $(element).find('h2 a').attr('href');
      const image = "https://infotourney.com" + $(element).find('img').attr('src');
      const startDate = $(element).find('.published time').attr('datetime');
      const startDateText = $(element).find('.published').text().trim();
      const registrationEndDateText = $(element).find('p').last().text().trim();
      const description = $(element).find('p').eq(1).text().trim();

      const tags = [];
      $(element).find('.tags a').each((_, tagElement) => {
        tags.push($(tagElement).text().trim());
      });

      tournaments.push({
        title,
        url,
        image,
        startDate,
        startDateText,
        registrationEndDateText,
        description,
        tags,
      });
    });

    if (tournaments.length === 0) {
      return res.json({ success: true, message: "Tidak ada turnamen Mobile Legends untuk saat ini." });
    }

    res.json({ success: true, tournaments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mendapatkan data turnamen.', details: error.message });
  }
});

module.exports = router;
uter;
