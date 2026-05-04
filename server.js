require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2'); // <-- Pastikan baris ini ADA
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const checkDiskSpace = require('check-disk-space').default;

const app = express();

// --- 1. Database Connection (Satu Koneksi Saja) ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD, 
    database: 'db_cloudku'
});

// Cek Koneksi di Console
db.connect((err) => {
    if (err) {
        console.error('Gagal koneksi ke MySQL:', err.message);
    } else {
        console.log('Terhubung ke MySQL: db_cloudku');
    }
});

// --- 2. Middleware ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'rahasia-cloud', 
    resave: false, 
    saveUninitialized: true 
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public')); 

// --- 3. Multer ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'FILE-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// --- 4. Routes (Pastikan semua pakai 'db.query') ---

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

app.post('/upload', upload.single('myFile'), (req, res) => {
    res.send('<h3>File Berhasil Terunggah!</h3><a href="/dashboard">Kembali</a>');
});

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
        if (err) return res.status(500).json({ error: "Gagal hapus file" });
        res.json({ message: 'File berhasil dihapus!' });
    });
});

app.get('/api/disk-space', async (req, res) => {
    try {
        const diskSpace = await checkDiskSpace('/'); 
        res.json({
            free: (diskSpace.free / 1024 / 1024 / 1024).toFixed(2), 
            size: (diskSpace.size / 1024 / 1024 / 1024).toFixed(2)  
        });
    } catch (err) {
        res.status(500).send("Gagal cek storage");
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));