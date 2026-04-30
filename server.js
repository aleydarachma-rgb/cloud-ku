const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

// Konfigurasi Database (Sesuaikan dengan DB di VPS nanti)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password_vps_kamu',
    database: 'db_cloudku'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'rahasia-cloud', resave: false, saveUninitialized: true }));

// Route Halaman Login Sederhana
app.get('/', (req, res) => {
    res.send(`
        <h2>Login Cloud-Ku</h2>
        <form action="/login" method="POST">
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button type="submit">Login</button>
        </form>
    `);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Logika login sederhana (Contoh: admin/admin)
    if (username === 'admin' && password === 'admin') {
        req.session.loggedIn = true;
        res.send('Selamat datang di Dashboard VPS!');
    } else {
        res.send('Login Gagal!');
    }
});

app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});