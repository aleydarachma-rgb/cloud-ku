require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// 1. Database Connection (Menggunakan .env)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD, 
    database: 'db_cloudku'
});

// 2. Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'rahasia-cloud', 
    resave: false, 
    saveUninitialized: true 
}));

// Agar file di folder uploads bisa dibuka di browser (Penting untuk Preview)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public')); 

// 3. Konfigurasi Simpan File (Multer)
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'FILE-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

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

// --- API CATATAN ---

app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;
    db.query("INSERT INTO notes (title, content) VALUES (?, ?)", [title, content], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Catatan tersimpan!' });
    });
});

app.get('/api/notes', (req, res) => {
    db.query("SELECT * FROM notes ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    db.query("DELETE FROM notes WHERE id = ?", [noteId], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Catatan dihapus!' });
    });
});

// --- API CLOUD STORAGE & PREVIEW ---

app.post('/upload', upload.single('myFile'), (req, res) => {
    res.send('<h3>File Berhasil Terunggah!</h3><a href="/dashboard">Kembali</a>');
});

// Mengambil daftar file untuk ditampilkan di Dashboard
app.get('/api/files', (req, res) => {
    fs.readdir('./uploads', (err, files) => {
        if (err) return res.status(500).send(err);
        // Kirim daftar file dalam bentuk array
        res.json(files);
    });
});

// Menghapus file fisik dari folder uploads
app.delete('/api/files/:name', (req, res) => {
    const fileName = req.params.name;
    const filePath = path.join(__dirname, 'uploads', fileName);
    
    fs.unlink(filePath, (err) => {
        if (err) return res.status(500).json({ error: "Gagal hapus file di server" });
        res.json({ message: 'File berhasil dihapus!' });
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));