import express from 'express';
import { searchStickers, getStickersFromPack } from './sticker.js';

const router = express.Router();

// Endpoint untuk mencari stiker berdasarkan query dan page
router.get('/', async (req, res) => {
    const { mode, query, page, packUrl } = req.query;

    if (!mode) {
        return res.status(400).json({ error: 'Parameter mode tidak diberikan!' });
    }

    try {
        if (mode === 'searchStickers') {
            if (!query || !page) {
                return res.status(400).json({ error: 'Query dan page harus diberikan untuk mode searchStickers!' });
            }
            const stickerPacks = await searchStickers(query, page);
            res.json({ stickerPacks });
        } else if (mode === 'getStickersFromPack') {
            if (!packUrl) {
                return res.status(400).json({ error: 'Pack URL harus diberikan untuk mode getStickersFromPack!' });
            }
            const stickers = await getStickersFromPack(packUrl);
            res.json({ stickers });
        } else {
            res.status(400).json({ error: 'Mode yang diberikan tidak valid!' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan di server.' });
    }
});

module.exports router;