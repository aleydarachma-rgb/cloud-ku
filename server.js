// Balikin ke satu koneksi saja biar enteng
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD, 
    database: 'db_cloudku' // Database yang sudah ada tabelnya
});

// Pastikan semua route (notes) pakai 'db' lagi, bukan 'dbNotes'