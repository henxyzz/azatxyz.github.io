const express = require("express");
const axios = require("axios");
const router = express.Router();

const defaultHeaders = {
  "User-Agent": "Mozilla/5.0",
  "accept-language": "id-ID",
};

// Venice Chatbot API
router.get("/chat", async (req, res) => {
  const question = req.query.question;
  if (!question) {
    return res.status(400).json({ error: "Query 'question' tidak boleh kosong." });
  }

  try {
    const response = await axios.post("https://venice.ai/api/inference/chat", {
      question,
    }, {
      headers: defaultHeaders,
    });

    res.json({ success: true, answer: response.data });
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan pada layanan chatbot." });
  }
});

module.exports = router;