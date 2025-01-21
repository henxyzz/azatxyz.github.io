const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { exec } = require('child_process');

// Load environment variables from .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Gunakan port dinamis untuk Clever Cloud

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 1000, // Maksimal 1000 request per menit
  message: 'Terlalu banyak request. Coba lagi nanti.',
});

app.use('/api/', limiter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware untuk melayani file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Verifikasi password untuk akses halaman upload
app.get('/upload', (req, res) => {
  const password = req.query.password; // Mengambil password dari query string

  if (password === process.env.UPLOAD_PASSWORD) {
    res.sendFile(path.join(__dirname, 'public', 'upload.html')); // Akses halaman upload
  } else {
    res.status(403).send('Password salah. Akses ditolak.');
  }
});

// Setup Multer Storage untuk file yang di-upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination = req.body.destination || 'public'; // Default ke public jika kosong
    const folder = destination === 'public' ? 'public' : 'routes';
    cb(null, path.join(__dirname, folder));
  },
  filename: (req, file, cb) => {
    const customName = req.body.name || file.originalname; // Default ke originalname jika name kosong
    cb(null, customName);
  },
});

const upload = multer({ storage });

// Endpoint untuk menangani file upload
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('req.file:', req.file); // Debug informasi file
  console.log('req.body:', req.body); // Debug informasi form

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File tidak ditemukan. Pastikan form upload memiliki field 'file'.",
    });
  }

  const folder = req.body.destination || 'public';
  const filePath = path.join(__dirname, folder, req.file.filename);

  if (folder === 'routes') {
    const moduleName = req.file.filename.replace('.js', '');
    updatePackageJson(moduleName, () => {
      res.send(`File JavaScript berhasil diupload dan endpoint tersedia di /api/${moduleName}`);
      registerRoutes(); // Registrasi ulang endpoint
    });
  } else {
    res.send(`File berhasil diupload ke folder ${folder}`);
  }
});

// Endpoint untuk mendapatkan daftar file di folder tertentu
app.get('/files', (req, res) => {
  const folder = req.query.folder;
  if (!folder || (folder !== 'public' && folder !== 'routes')) {
    return res.status(400).json({ error: 'Folder tidak valid. Gunakan "public" atau "routes".' });
  }

  const directoryPath = path.join(__dirname, folder);
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(`Gagal membaca folder ${folder}:`, err);
      return res.status(500).json({ error: `Gagal membaca folder ${folder}` });
    }

    res.json({ folder, files });
  });
});

// Endpoint untuk menghapus file
app.delete('/files', (req, res) => {
  const folder = req.body.folder;
  const fileName = req.body.fileName;

  if (!folder || !fileName || (folder !== 'public' && folder !== 'routes')) {
    return res.status(400).json({ error: 'Parameter folder atau fileName tidak valid.' });
  }

  const filePath = path.join(__dirname, folder, fileName);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Gagal menghapus file ${fileName} di folder ${folder}:`, err);
      return res.status(500).json({ error: `Gagal menghapus file ${fileName}` });
    }

    console.log(`File ${fileName} berhasil dihapus dari folder ${folder}`);
    res.json({ message: `File ${fileName} berhasil dihapus dari folder ${folder}` });
  });
});

// Fungsi untuk memperbarui package.json dan menginstal ulang modul
function updatePackageJson(moduleName, callback) {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (!packageJson.dependencies) packageJson.dependencies = {};
  if (!packageJson.dependencies[moduleName]) {
    packageJson.dependencies[moduleName] = 'latest';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log(`Menambahkan ${moduleName} ke package.json dan menjalankan npm install...`);
    exec('npm install', (err, stdout, stderr) => {
      if (err) {
        console.error('Gagal menginstal modul:', err);
      } else {
        console.log(stdout);
        console.error(stderr);
        callback();
      }
    });
  } else {
    callback();
  }
}

// Fungsi untuk meregistrasi endpoint dinamis dari folder routes
function registerRoutes() {
  const routesPath = path.join(__dirname, 'routes');
  fs.readdir(routesPath, (err, files) => {
    if (err) {
      console.error('Gagal membaca folder routes:', err);
      return;
    }

    files.forEach((file) => {
      if (file.endsWith('.js')) {
        const routePath = `/api/${file.replace('.js', '')}`;
        const modulePath = path.join(__dirname, 'routes', file);

        // Hapus cache sebelumnya (hot reload)
        delete require.cache[require.resolve(modulePath)];

        // Daftarkan endpoint
        try {
          const route = require(modulePath);
          app.use(routePath, route);
          console.log(`Endpoint otomatis terdaftar: ${routePath}`);
        } catch (err) {
          console.error(`Gagal meregistrasi file ${file} sebagai endpoint:`, err);
        }
      }
    });
  });
}

// Register endpoints dinamis saat server mulai
registerRoutes();

// Monitor perubahan pada folder routes
fs.watch(path.join(__dirname, 'routes'), (eventType, filename) => {
  if (eventType === 'change' || eventType === 'rename') {
    console.log(`Perubahan terdeteksi pada file: ${filename}`);
    registerRoutes(); // Daftarkan ulang endpoint
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});