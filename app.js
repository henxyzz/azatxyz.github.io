const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const port = 3000;

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 1000, // Maksimal 1000 request per menit
  message: 'Terlalu banyak request. Coba lagi nanti.',
});

app.use('/api/', limiter);

// Middleware untuk melayani file statis dari folder 'public' dan 'routes'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'routes')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup Multer Storage untuk file yang di-upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination = req.body.destination;
    const folder = destination === 'public' ? 'public' : 'routes'; // Pilih folder tujuan
    cb(null, path.join(__dirname, folder)); // Tentukan folder tujuan
  },
  filename: (req, file, cb) => {
    const destination = req.body.destination;
    if (destination === 'public') {
      cb(null, file.originalname); // Nama file HTML tetap sama
    } else {
      cb(null, req.body.name || file.originalname); // Jika file JS, pakai nama yang diberikan user
    }
  }
});

const upload = multer({ storage });

// Endpoint untuk menampilkan form upload
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Endpoint untuk menangani file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file && !req.body['html-code'] && !req.body['js-code']) {
    return res.status(400).send('No file or code uploaded.');
  }

  if (req.body.destination === 'public' && req.body['html-code']) {
    // Jika HTML diupload
    const htmlContent = req.body['html-code'];
    const fileName = req.body.name || 'index.html'; // Nama file HTML, default index.html
    fs.writeFileSync(path.join(__dirname, 'public', fileName), htmlContent);
    return res.send(`HTML berhasil diupload dengan nama: ${fileName}`);
  }

  if (req.body.destination === 'routes' && req.body['js-code']) {
    // Jika JavaScript diupload via kode
    const jsContent = req.body['js-code'];
    const fileName = req.body.name || 'script.js'; // Nama file JS, default script.js
    fs.writeFileSync(path.join(__dirname, 'routes', fileName), jsContent);
    return res.send(`File JavaScript berhasil diupload dengan nama: ${fileName}`);
  }

  res.send('File berhasil diupload.');
});

// Membaca file di folder 'routes' secara otomatis dan menambah route
const routesPath = path.join(__dirname, 'routes');
let routeFiles = [];

function loadRoutes() {
  // Membaca ulang semua file .js di folder routes
  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith('.js') && !routeFiles.includes(file)) {
      const routeName = file.replace('.js', ''); // Menghilangkan ekstensi .js
      const routePath = path.join(routesPath, file);
      const route = require(routePath);
      app.use(`/api/${routeName}`, route);
      console.log(`Route /api/${routeName} ditambahkan dari ${file}`);
      routeFiles.push(file); // Menambahkan file ke array agar tidak duplikat
    }
  });
}

// Load routes pertama kali
loadRoutes();

// Watch for changes in the routes folder and add new routes
fs.watch(routesPath, (eventType, filename) => {
  if (filename && filename.endsWith('.js')) {
    console.log(`File ${filename} diubah atau ditambahkan di folder routes`);
    // Load ulang semua routes
    loadRoutes();
    installDependenciesIfNeeded(filename);  // Cek dan install dependencies jika diperlukan
  }
});

// Memantau perubahan di public untuk file statis
fs.watch(path.join(__dirname, 'public'), (eventType, filename) => {
  if (filename) {
    console.log(`File ${filename} diubah atau ditambahkan di folder public`);
  }
});

// Fungsi untuk memeriksa dan menambahkan dependency di package.json
function installDependenciesIfNeeded(filename) {
  const routePath = path.join(__dirname, 'routes', filename);
  const route = require(routePath);
  const requiredModules = Object.keys(route);  // Memeriksa module yang diperlukan oleh file route

  // Cek apakah ada module baru yang perlu ditambahkan
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = require(packageJsonPath);

  requiredModules.forEach(module => {
    if (!packageJson.dependencies[module]) {
      // Tambahkan module baru ke dependencies
      console.log(`Menambahkan module ${module} ke package.json`);
      packageJson.dependencies[module] = 'latest';  // Menambahkan versi terbaru
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Jalankan npm install untuk menambah dependensi tersebut
      exec('npm install', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error saat menjalankan npm install: ${stderr}`);
        } else {
          console.log(`Modules berhasil diinstall: ${stdout}`);
        }
      });
    }
  });
}

// Endpoint untuk mendapatkan daftar file dari public atau routes
app.get('/files', (req, res) => {
  const folder = req.query.folder === 'public' ? 'public' : 'routes';
  const folderPath = path.join(__dirname, folder);

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).send('Gagal membaca folder');
    }
    const fileList = files.filter(file => file.endsWith('.html') || file.endsWith('.js'));
    res.json(fileList);
  });
});

// Endpoint untuk menghapus file
app.delete('/delete-file', (req, res) => {
  const folder = req.query.folder === 'public' ? 'public' : 'routes';
  const fileName = req.query.filename;
  const filePath = path.join(__dirname, folder, fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal menghapus file' });
    }
    res.json({ message: `File ${fileName} berhasil dihapus` });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
