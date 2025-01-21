const express = require("express");
const axios = require("axios");
const router = express.Router();

const defaultHeaders = {
  "User-Agent": "Mozilla/5.0",
  "accept-language": "id-ID",
};

// Endpoint Chatbot API menggunakan query parameter biasa
router.get("/", async (req, res) => {
  const question = req.query.question;
  if (!question) {
    return res.status(400).json({
      error: "Query 'question' tidak boleh kosong.",
      usage: {
        endpoint: "/api/venice",
        method: "GET",
        query: { question: "Pertanyaan Anda" },
      },
      author: "Azatxyz", // Menambahkan informasi author
    });
  }

  try {
    const response = await axios.post(
      "https://venice.ai/api/inference/chat",
      { question },
      { headers: defaultHeaders }
    );

    res.json({
      success: true,
      answer: response.data.answer || "Tidak ada jawaban yang diberikan.",
      author: "Azatxyz", // Menambahkan informasi author
    });
  } catch (error) {
    console.error("Error Chatbot API:", error.message);
    res.status(500).json({
      error: "Terjadi kesalahan pada layanan chatbot.",
      details: error.message,
      author: "Azatxyz", // Menambahkan informasi author
    });
  }
});

module.exports = router;