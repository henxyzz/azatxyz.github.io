const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");

// **Endpoint Utama untuk TikTok**
router.get("/", async (req, res) => {
  const { download, slides, url } = req.query;

  // Petunjuk saat query parameter tidak ada
  if (!download && !slides) {
    return res.status(400).json({
      success: false,
      message: "Gunakan salah satu parameter berikut:",
      usage: [
        { endpoint: "/api/tiktok?download=&url=", description: "Download video TikTok" },
        { endpoint: "/api/tiktok?slides=&url=", description: "Ambil slide dari video TikTok" },
      ],
    });
  }

  // Validasi URL
  if (!url) {
    return res.status(400).json({
      success: false,
      message: "Parameter URL tidak boleh kosong.",
    });
  }

  // **Proses Download Video**
  if (download !== undefined) {
    try {
      let result = {};
      let form = new FormData();
      form.append("q", url);
      form.append("lang", "id");

      const { data } = await axios.post("https://savetik.co/api/ajaxSearch", form, {
        headers: form.getHeaders(),
      });

      let $ = cheerio.load(data.data);

      result.status = true;
      result.caption = $("div.video-data > div > .tik-left > div > .content > div > h3").text();
      result.server1 = {
        quality: "MEDIUM",
        url: $("div.video-data > div > .tik-right > div > p:nth-child(1) > a").attr("href"),
      };
      result.serverHD = {
        quality: $("div.video-data > div > .tik-right > div > p:nth-child(3) > a")
          .text()
          .split("MP4 ")[1],
        url: $("div.video-data > div > .tik-right > div > p:nth-child(3) > a").attr("href"),
      };
      result.audio = $("div.video-data > div > .tik-right > div > p:nth-child(4) > a").attr("href");

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat memproses permintaan.",
        error: error.message,
      });
    }
  }

  // **Proses Ambil Slide**
  if (slides !== undefined) {
    try {
      const response = await axios({
        method: "POST",
        url: "https://tikvideo.app/api/ajaxSearch",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        },
        data: new URLSearchParams({ q: url, lang: "id" }).toString(),
      });

      let result = [];
      if (response.data.status === "ok") {
        let $ = cheerio.load(response.data.data);
        $("img").each((index, element) => {
          const imgSrc = $(element).attr("src");
          if (imgSrc && !imgSrc.includes(".webp")) {
            result.push(imgSrc);
          }
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tidak ada slide yang ditemukan.",
        });
      }

      return res.json({
        success: true,
        slides: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat memproses permintaan.",
        error: error.message,
      });
    }
  }

  // **Jika Parameter Tidak Valid**
  return res.status(400).json({
    success: false,
    message: "Parameter tidak valid.",
    usage: [
      { endpoint: "/api/tiktok?download=&url=", description: "Download video TikTok" },
      { endpoint: "/api/tiktok?slides=&url=", description: "Ambil slide dari video TikTok" },
    ],
  });
});

module.exports = router;