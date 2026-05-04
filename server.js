require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2'); // BARIS INI JANGAN SAMPAI HILANG
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const checkDiskSpace = require('check-disk-space').default;

const app = express();

// --- 1. Database Connection (KEMBALI KE SATU DB) ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD, 
    database: 'db_cloudku'
});

// Cek koneksi agar tidak crash diam-diam
db.connect((err) => {
    if (err) {
        console.error('Gagal koneksi ke MySQL:', err.message);
        return;
    }
    console.log('Terhubung ke database db_cloudku');
});

// ... (sisa kode middleware, multer, dan routes milikmu di bawahnya)