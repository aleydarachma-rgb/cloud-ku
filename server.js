const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Konfigurasi Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password_vps_kamu', // <--- SAMAKAN DENGAN DI VPS
    database: 'db_cloudku'
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'rahasia-cloud', resave: false, saveUninitialized: true }));
app.use(express.static('public')); 
app.use('/uploads', express.static('uploads')); // Agar file yang diupload bisa diakses/dilihat

// Konfigurasi Multer (Upload File)
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'FILE-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Pastikan folder uploads ada
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// --- ROUTES ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        req.session.loggedIn = true;
        res.redirect('/dashboard');
    } else {
        res.send('Login Gagal! <a href="/">Kembali</a>');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API: Simpan Catatan
app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;
    db.query("INSERT INTO notes (title, content) VALUES (?, ?)", [title, content], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Catatan tersimpan!' });
    });
});

// API: Ambil Semua Catatan
app.get('/api/notes', (req, res) => {
    db.query("SELECT * FROM notes ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// --- FITUR BARU: HAPUS CATATAN ---
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    db.query("DELETE FROM notes WHERE id = ?", [noteId], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Catatan dihapus!' });
    });
});

// API: Upload File
app.post('/upload', upload.single('myFile'), (req, res) => {
    res.send('<h3>File Berhasil Terunggah ke VPS!</h3><a href="/dashboard">Kembali ke Dashboard</a>');
});

// --- FITUR BARU: LIHAT DAFTAR FILE & HAPUS FILE ---
app.get('/api/files', (req, res) => {
    fs.readdir('./uploads', (err, files) => {
        if (err) return res.status(500).send(err);
        res.json(files);
    });
});

app.delete('/api/files/:name', (req, res) => {
    const fileName = req.params.name;
    const filePath = path.join(__dirname, 'uploads', fileName);
    
    fs.unlink(filePath, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'File berhasil dihapus dari VPS!' });
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));