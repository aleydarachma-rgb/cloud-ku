const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi Penyimpanan File di VPS
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Pastikan folder uploads ada
if (!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
}

// ROUTE: Upload File
app.post('/upload', upload.single('myFile'), (req, res) => {
    res.send('File berhasil diupload ke VPS!');
});

// ROUTE: Simpan Catatan ke Database
app.post('/add-note', (req, res) => {
    const { title, content } = req.body;
    const query = "INSERT INTO notes (title, content) VALUES (?, ?)";
    db.query(query, [title, content], (err, result) => {
        if (err) throw err;
        res.send('Catatan tersimpan di database VPS!');
    });
});