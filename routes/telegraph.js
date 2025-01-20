const express = require('express');
const axios = require('axios');
const router = express.Router();

// Endpoint untuk upload gambar dalam format base64 atau URL
router.get('/telegraph', async (req, res) => {
  const { image, url } = req.query;

  // Validasi parameter
  if (!image && !url) {
    return res.status(400).json({
      success: false,
      message: 'Silakan masukkan gambar (base64) atau URL gambar.',
      usage: {
        endpoint: '/telegraph',
        method: 'GET',
        query: { image: 'base64_image_data' },
      },
    });
  }

  try {
    let imageData = null;

    // Jika menerima base64 image
    if (image) {
      imageData = image;
    }

    // Jika menerima URL gambar, ambil gambar dari URL
    if (url) {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      imageData = Buffer.from(response.data, 'binary').toString('base64');
    }

    // Kirim gambar ke API Telegraph
    const telegraphResponse = await axios.post('https://telegra.ph/upload', {
      file: imageData,
    });

    // Jika sukses, kembalikan URL gambar
    if (telegraphResponse.data && telegraphResponse.data[0] && telegraphResponse.data[0].src) {
      const imageUrl = `https://telegra.ph${telegraphResponse.data[0].src}`;
      return res.json({
        success: true,
        message: 'Gambar berhasil di-upload.',
        imageUrl,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Gagal meng-upload gambar.',
      });
    }
  } catch (error) {
    console.error('Error saat meng-upload gambar:', error);
    return res.status(500).json({
      success: false,
      message: 'Ups! Terjadi kesalahan saat meng-upload gambar.',
      error: error.message,
    });
  }
});

module.exports = router;