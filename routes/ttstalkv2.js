const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

async function tiktokStalk(username) {
    try {
        const response = await axios.get(`https://www.tiktok.com/@${username}?_t=ZS-8tHANz7ieoS&_r=1`);
        const html = response.data;
        const $ = cheerio.load(html);
        const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        const parsedData = JSON.parse(scriptData);

        const userDetail = parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail'];
        if (!userDetail) {
            throw new Error('User tidak ditemukan');
        }

        const userInfo = userDetail.userInfo?.user;
        const stats = userDetail.userInfo?.stats;

        const metadata = {
            userInfo: {
                id: userInfo?.id || null,
                username: userInfo?.uniqueId || null,
                nama: userInfo?.nickname || null,
                avatar: userInfo?.avatarLarger || null,
                bio: userInfo?.signature || null,
                verifikasi: userInfo?.verified || false,
                totalfollowers: stats?.followerCount || 0,
                totalmengikuti: stats?.followingCount || 0,
                totaldisukai: stats?.heart || 0,
                totalvideo: stats?.videoCount || 0,
                totalteman: stats?.friendCount || 0,
            }
        };

        return metadata;
    } catch (error) {
        return { error: error.message };
    }
}

router.get("/", async (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ error: "Parameter 'username' wajib diisi" });
    }

    const result = await tiktokStalk(username);
    if (result.error) {
        return res.status(404).json({ error: result.error });
    }

    res.json(result);
});

module.exports = router;