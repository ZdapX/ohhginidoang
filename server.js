const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Konfigurasi Socket.io agar lebih kompatibel
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Setup EJS dan Path Folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Path Absolut
app.use(express.static(path.join(__dirname, 'public'))); // Path Absolut

let requestCount = 0;

// Middleware Hitung Request
app.use((req, res, next) => {
    requestCount++;
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

// Logic Real-time
setInterval(() => {
    const rps = requestCount;
    requestCount = 0;

    let status = "Sistem Aman";
    let level = "low";

    if (rps > 100) { status = "CRITICAL ATTACK!"; level = "critical"; }
    else if (rps > 50) { status = "High Attack"; level = "high"; }
    else if (rps > 20) { status = "Medium Traffic"; level = "medium"; }
    else if (rps > 0) { status = "Low Traffic"; level = "low"; }

    io.emit('updateStats', { rps, status, level });
}, 1000);

// Untuk Vercel, kita perlu export app, tapi untuk lokal kita pakai server.listen
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = server; // Penting untuk Vercel
