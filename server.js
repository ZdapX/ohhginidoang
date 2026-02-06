const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

let requestCount = 0;
let lastRps = 0;

// Middleware untuk menghitung setiap request yang masuk
app.use((req, res, next) => {
    requestCount++;
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

// Logic perhitungan RPS setiap 1 detik
setInterval(() => {
    lastRps = requestCount;
    requestCount = 0;

    let status = "Normal";
    let level = "low";

    if (lastRps > 100) {
        status = "CRITICAL ATTACK!";
        level = "critical";
    } else if (lastRps > 50) {
        status = "High Traffic / Attack";
        level = "high";
    } else if (lastRps > 20) {
        status = "Medium Traffic";
        level = "medium";
    } else if (lastRps > 0) {
        status = "Low Traffic";
        level = "low";
    } else {
        status = "No Traffic";
        level = "idle";
    }

    io.emit('updateStats', {
        rps: lastRps,
        status: status,
        level: level
    });
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
