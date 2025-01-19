const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Fungsi untuk mencari aplikasi di Play Store
async function playStoreSearch(search) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(`https://play.google.com/store/search?q=${search}&c=apps`);
      const hasil = [];
      const $ = cheerio.load(data);

      $('.ULeU3b > .VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.Y8RQXd > .VfPpkd-aGsRMb > .VfPpkd-EScbFb-JIbuQc.TAQqTe > a').each((i, u) => {
        const linkk = $(u).attr('href');
        const nama = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > .DdYX5').text();
        const developer = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > .wMUdtb').text();
        const img = $(u).find('.j2FCNc > img').attr('src');
        const rate = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > div').attr('aria-label');
        const rate2 = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > div > span.w2kbF').text();
        const link = `https://play.google.com${linkk}`;

        hasil.push({
          link: link,
          nama: nama ? nama : 'No name',
          developer: developer ? developer : 'No Developer',
          img: img ? img : 'https://i.ibb.co/G7CrCwN/404.png',
          rate: rate ? rate : 'No Rate',
          rate2: rate2 ? rate2 : 'No Rate',
          link_dev: `https://play.google.com/store/apps/developer?id=${developer.split(" ").join('+')}`
        });
      });

      if (hasil.every(x => x === undefined)) return resolve({ developer: '@ngawj', mess: 'no result found' });
      resolve(hasil);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}

// Endpoint untuk pencarian aplikasi PlayStore
router.get('/', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const results = await playStoreSearch(query);

    if (results.length > 0) {
      res.json({
        status: 'success',
        message: 'Hasil pencarian aplikasi di PlayStore',
        results: results
      });
    } else {
      res.status(404).json({ error: 'Tidak Ada Hasil.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

module.exports = router;