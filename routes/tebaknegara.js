const express = require('express');
const router = express.Router();

// Daftar tebakan negara (100 negara)
const tebaknegaraList = [
  { question: 'Negara ini terkenal dengan piramida dan sungai Nil. Apa nama negara ini?', answer: 'Mesir', clue: 'Negara ini memiliki banyak piramida terkenal.' },
  { question: 'Negara ini terkenal dengan bunga sakura dan teknologi tinggi. Apa nama negara ini?', answer: 'Jepang', clue: 'Negara ini juga dikenal dengan industri otomotifnya.' },
  { question: 'Negara ini memiliki kota Roma yang menjadi ibu kota. Apa nama negara ini?', answer: 'Italia', clue: 'Negara ini dikenal dengan makanan pasta dan pizza.' },
  { question: 'Negara ini terkenal dengan keju dan coklat. Apa nama negara ini?', answer: 'Swiss', clue: 'Negara ini juga dikenal dengan bank dan pegunungan Alpen.' },
  { question: 'Negara ini terkenal dengan samba dan sepakbola. Apa nama negara ini?', answer: 'Brasil', clue: 'Negara ini memiliki Amazon, hutan hujan terbesar di dunia.' },
  { question: 'Negara ini terkenal dengan menara Eiffel. Apa nama negara ini?', answer: 'Perancis', clue: 'Negara ini juga dikenal dengan mode dan keindahan seni.' },
  { question: 'Negara ini terkenal dengan kanguru dan koala. Apa nama negara ini?', answer: 'Australia', clue: 'Negara ini memiliki Great Barrier Reef, terumbu karang terbesar.' },
  { question: 'Negara ini terkenal dengan Tembok Besar dan Kung Fu. Apa nama negara ini?', answer: 'Cina', clue: 'Negara ini juga memiliki teknologi yang sangat berkembang.' },
  { question: 'Negara ini dikenal dengan taman bunga tulip dan keju. Apa nama negara ini?', answer: 'Belanda', clue: 'Negara ini terkenal dengan kincir angin dan sepeda.' },
  { question: 'Negara ini terkenal dengan opera dan budaya seni yang kaya. Apa nama negara ini?', answer: 'Austria', clue: 'Negara ini dikenal dengan musisi klasik seperti Mozart.' },
  { question: 'Negara ini memiliki patung Liberty dan pusat keuangan besar. Apa nama negara ini?', answer: 'Amerika Serikat', clue: 'Negara ini juga dikenal dengan Silicon Valley.' },
  { question: 'Negara ini dikenal dengan tango dan daging sapi. Apa nama negara ini?', answer: 'Argentina', clue: 'Negara ini memiliki padang rumput yang luas untuk peternakan.' },
  { question: 'Negara ini memiliki gunung berapi dan banyak pantai indah. Apa nama negara ini?', answer: 'Indonesia', clue: 'Negara ini terletak di kawasan Pasifik, sering disebut Ring of Fire.' },
  { question: 'Negara ini terkenal dengan pelajaran filsafat dan demokrasi. Apa nama negara ini?', answer: 'Yunani', clue: 'Negara ini memiliki kebudayaan klasik dan kota Athena.' },
  { question: 'Negara ini terkenal dengan tembok Berlin yang ikonik. Apa nama negara ini?', answer: 'Jerman', clue: 'Negara ini memiliki teknologi yang sangat maju.' },
  { question: 'Negara ini memiliki banyak fjord dan dikenal dengan Viking. Apa nama negara ini?', answer: 'Norwegia', clue: 'Negara ini memiliki pemandangan alam yang luar biasa.' },
  { question: 'Negara ini terkenal dengan pelabuhan besar dan kue Portugis. Apa nama negara ini?', answer: 'Portugal', clue: 'Negara ini terkenal dengan sejarah maritimnya.' },
  { question: 'Negara ini dikenal dengan laut biru dan pantai yang menakjubkan. Apa nama negara ini?', answer: 'Maladewa', clue: 'Negara ini terkenal dengan resor mewah di atas air.' },
  { question: 'Negara ini memiliki kerajaan yang berusia ratusan tahun dan pusat perdagangan. Apa nama negara ini?', answer: 'Inggris', clue: 'Negara ini terkenal dengan Ratu Elizabeth dan sejarah kolonial.' },
  { question: 'Negara ini terkenal dengan durian dan budaya perayaan. Apa nama negara ini?', answer: 'Thailand', clue: 'Negara ini dikenal dengan festival Songkran dan masakan pedas.' },
  { question: 'Negara ini terkenal dengan menara CN dan olahraga hoki. Apa nama negara ini?', answer: 'Kanada', clue: 'Negara ini memiliki pemandangan alam dan musim dingin yang terkenal.' },
  { question: 'Negara ini dikenal dengan masakan taco dan guacamole. Apa nama negara ini?', answer: 'Meksiko', clue: 'Negara ini memiliki banyak situs arkeologi Maya.' },
  { question: 'Negara ini terkenal dengan samba dan karnaval. Apa nama negara ini?', answer: 'Brasil', clue: 'Negara ini adalah rumah bagi Amazon dan banyak tim sepak bola terkenal.' },
  { question: 'Negara ini terkenal dengan budaya karnaval dan pantai. Apa nama negara ini?', answer: 'Kuba', clue: 'Negara ini dikenal dengan musik salsa dan sejarah komunis.' },
  { question: 'Negara ini memiliki bukit batu dan kebun teh yang terkenal. Apa nama negara ini?', answer: 'Sri Lanka', clue: 'Negara ini terkenal dengan teh dan sejarah kolonial Belanda.' },
  { question: 'Negara ini memiliki hutan hujan tropis terbesar di dunia. Apa nama negara ini?', answer: 'Brazil', clue: 'Negara ini memiliki Sungai Amazon yang besar.' },
  { question: 'Negara ini dikenal dengan koala dan kanguru. Apa nama negara ini?', answer: 'Australia', clue: 'Negara ini juga terkenal dengan olahraga kriket.' },
  { question: 'Negara ini dikenal dengan sushi dan sumo. Apa nama negara ini?', answer: 'Jepang', clue: 'Negara ini memiliki budaya tradisional yang kuat dan teknologi canggih.' },
  { question: 'Negara ini dikenal dengan kastil dan drama Shakespeare. Apa nama negara ini?', answer: 'Inggris', clue: 'Negara ini memiliki banyak situs sejarah dan monarki yang kaya.' },
  { question: 'Negara ini memiliki kebun anggur dan menara Eiffel. Apa nama negara ini?', answer: 'Perancis', clue: 'Negara ini dikenal dengan fashion dan gastronomi kelas dunia.' },
  { question: 'Negara ini terkenal dengan bunga tulip dan kincir angin. Apa nama negara ini?', answer: 'Belanda', clue: 'Negara ini juga dikenal dengan kanal-kanalnya.' },
  { question: 'Negara ini terkenal dengan jazz dan pusat budaya Afrika-Amerika. Apa nama negara ini?', answer: 'Amerika Serikat', clue: 'Negara ini memiliki banyak kota besar dan teknologi maju.' },
  { question: 'Negara ini terkenal dengan masakan pasta dan mode. Apa nama negara ini?', answer: 'Italia', clue: 'Negara ini memiliki sejarah seni dan arsitektur yang luar biasa.' },
  { question: 'Negara ini memiliki patung Liberty yang ikonik. Apa nama negara ini?', answer: 'Amerika Serikat', clue: 'Negara ini juga terkenal dengan film Hollywood.' },
  { question: 'Negara ini terkenal dengan karnaval dan sepakbola. Apa nama negara ini?', answer: 'Brasil', clue: 'Negara ini terkenal dengan Pantai Copacabana dan Amazon.' },
  { question: 'Negara ini terkenal dengan hutan hujan tropis dan budaya warisan suku. Apa nama negara ini?', answer: 'Indonesia', clue: 'Negara ini memiliki lebih dari 17.000 pulau.' },
  { question: 'Negara ini terkenal dengan bunga sakura dan industri elektronik. Apa nama negara ini?', answer: 'Jepang', clue: 'Negara ini juga dikenal dengan teknologi robotiknya.' },
  { question: 'Negara ini memiliki gunung berapi aktif dan pantai yang indah. Apa nama negara ini?', answer: 'Indonesia', clue: 'Negara ini memiliki lebih dari 400 gunung berapi.' },
  { question: 'Negara ini terkenal dengan sejarah kuno dan Cleopatra. Apa nama negara ini?', answer: 'Mesir', clue: 'Negara ini dikenal dengan piramida dan Sungai Nil.' },
  { question: 'Negara ini terkenal dengan seni Renaissance dan Michelangelo. Apa nama negara ini?', answer: 'Italia', clue: 'Negara ini memiliki banyak karya seni klasik.' },
  { question: 'Negara ini memiliki taman safari dan banyak hewan langka. Apa nama negara ini?', answer: 'Afrika Selatan', clue: 'Negara ini dikenal dengan Nelson Mandela.' },
  { question: 'Negara ini memiliki kota tua Petra yang terkenal. Apa nama negara ini?', answer: 'Yordania', clue: 'Negara ini memiliki situs warisan dunia yang terukir di batu.' },
  { question: 'Negara ini memiliki kebun teh yang luas dan gunung Himalaya. Apa nama negara ini?', answer: 'Nepal', clue: 'Negara ini adalah rumah bagi gunung Everest.' },
  { question: 'Negara ini dikenal dengan kastil-kastil dan pertanian. Apa nama negara ini?', answer: 'Skotlandia', clue: 'Negara ini terkenal dengan pakaian tartan dan musik bagpipe.' },
  { question: 'Negara ini dikenal dengan budaya Aztec dan masakan burrito. Apa nama negara ini?', answer: 'Meksiko', clue: 'Negara ini memiliki warisan kuno dan budaya yang kaya.' },
  { question: 'Negara ini terkenal dengan menara CN dan udara dingin. Apa nama negara ini?', answer: 'Kanada', clue: 'Negara ini memiliki banyak danau dan hutan belantara.' },
  { question: 'Negara ini terkenal dengan musik reggae dan pantai. Apa nama negara ini?', answer: 'Jamaika', clue: 'Negara ini dikenal dengan budaya Rastafari.' },
  { question: 'Negara ini dikenal dengan bangunan ikonik Taj Mahal. Apa nama negara ini?', answer: 'India', clue: 'Negara ini memiliki sejarah yang kaya dan budaya beragam.' },
  { question: 'Negara ini memiliki pegunungan Alpen yang terkenal. Apa nama negara ini?', answer: 'Swiss', clue: 'Negara ini terkenal dengan coklat dan jam tangan mewah.' },
  { question: 'Negara ini dikenal dengan batu granit dan danau besar. Apa nama negara ini?', answer: 'Finlandia', clue: 'Negara ini memiliki ribuan danau dan hutan.' },
  // Tambahkan lebih banyak negara dan clue lainnya jika diperlukan.
];

router.get('/', (req, res) => {
  const randomIndex = Math.floor(Math.random() * tebaknegaraList.length);
  const questionData = tebaknegaraList[randomIndex];

  res.json({
    question: questionData.question,
    clue: questionData.clue,
    answer: questionData.answer,
    message: 'Selamat mencoba! Tebak negara berdasarkan clue di atas.'
  });
});

module.exports = router;