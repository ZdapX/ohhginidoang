const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

let requestCount = 0;

app.use((req, res, next) => {
    requestCount++;
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

setInterval(() => {
    const rps = requestCount;
    requestCount = 0;

    let status = "Aman";
    let level = "low";

    if (rps > 100) { status = "CRITICAL ATTACK!"; level = "critical"; }
    else if (rps > 50) { status = "High Attack"; level = "high"; }
    else if (rps > 20) { status = "Medium Traffic"; level = "medium"; }
    else if (rps > 0) { status = "Low Traffic"; level = "low"; }

    io.emit('updateStats', { rps, status, level });
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
