const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Variabel untuk menyimpan data trafik
let requestCount = 0;
let lastRps = 0;

// Middleware Hitung Request - Pastikan next() dipanggil agar tidak stuck
app.use((req, res, next) => {
    if (req.path !== '/api/stats') {
        requestCount++;
    }
    next();
});

// Reset RPS setiap 1 detik (Internal Logic)
setInterval(() => {
    lastRps = requestCount;
    requestCount = 0;
}, 1000);

// Endpoint utama
app.get('/', (req, res) => {
    res.render('index');
});

// Endpoint API untuk grafik (Real-time polling)
app.get('/api/stats', (req, res) => {
    let status = "Sistem Aman";
    let level = "low";

    if (lastRps > 100) { status = "CRITICAL ATTACK!"; level = "critical"; }
    else if (lastRps > 50) { status = "High Attack"; level = "high"; }
    else if (lastRps > 20) { status = "Medium Traffic"; level = "medium"; }
    else if (lastRps > 0) { status = "Low Traffic"; level = "low"; }

    res.json({ rps: lastRps, status, level });
});

// Agar bisa jalan di lokal maupun Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => console.log(`Lokal: http://localhost:${PORT}`));
}

module.exports = app;
