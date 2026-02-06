
const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Gunakan array untuk menyimpan timestamp setiap request masuk
let requests = [];

app.use((req, res, next) => {
    // Abaikan request ke API stats agar tidak terhitung sebagai serangan
    if (req.path !== '/api/stats') {
        requests.push(Date.now());
    }
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

// Endpoint API
app.get('/api/stats', (req, res) => {
    const now = Date.now();
    // Hapus timestamp yang sudah lebih dari 5 detik (bersihkan memori)
    requests = requests.filter(time => now - time < 5000);

    // Hitung request dalam 2 detik terakhir untuk mendapatkan RPS yang akurat
    const rps = requests.filter(time => now - time < 2000).length;

    let status = "Sistem Aman";
    let level = "low";

    if (rps > 100) { status = "CRITICAL ATTACK!"; level = "critical"; }
    else if (rps > 50) { status = "High Attack"; level = "high"; }
    else if (rps > 20) { status = "Medium Traffic"; level = "medium"; }
    else if (rps > 0) { status = "Low Traffic"; level = "low"; }

    // Header agar tidak di-cache oleh browser atau Vercel
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({ rps, status, level });
});

module.exports = app;
