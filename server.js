const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// SETTING PATH (Penting agar tidak Error 500)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

let requestCount = 0;
let lastRps = 0;

// Middleware hitung request
app.use((req, res, next) => {
    requestCount++;
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

// Update data setiap detik
setInterval(() => {
    lastRps = requestCount;
    requestCount = 0;

    let status = "Normal";
    let level = "low";

    if (lastRps > 100) { status = "CRITICAL ATTACK!"; level = "critical"; }
    else if (lastRps > 50) { status = "High Traffic"; level = "high"; }
    else if (lastRps > 20) { status = "Medium Traffic"; level = "medium"; }
    else { status = "Safe"; level = "low"; }

    io.emit('updateStats', { rps: lastRps, status: status, level: level });
}, 1000);

// Export untuk Vercel
module.exports = server; 

// Jalankan server jika di lokal
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
