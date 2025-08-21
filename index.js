import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io'

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('new connection found');
    socket.on('chat message', (msg) => {
        console.log(msg);
    });

    socket.on('disconnect', ()=>{
        console.log("user disconnect");
    });
});

app.get('/login', (req, res) => {
    res.sendFile(join(__dirname, 'auth/login.html'));
});

server.listen(3000, () => {
    console.log("Server up");
});
