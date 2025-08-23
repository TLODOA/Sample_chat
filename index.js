import express from 'express';

import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Server } from 'socket.io';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

//
const app = express();
const server = createServer(app);
const io = new Server(server,{
    connectionStateRecovery:{}
});
const __dirname = dirname(fileURLToPath(import.meta.url));

// Database
const db = await open({
    filename : 'chat.db',
    driver : sqlite3.Database
});

await db.exec(`
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_offset TEXT UNIQUE,
    content TEXT
);`
);

// App route
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(join(__dirname, 'auth/login.html'));
});

// Init server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Server up");
});

// Server operations
io.on('connection', (socket) => {
    socket.on('chat message', async (msg) => {
        let result;
        try {
            result=await db.run('INSERT INTO messages (content) VALUES (?)', msg);
        } catch (e){
            return;
        }
        
        io.emit('chat message', msg, result.lastID);
    });

    if(!socket.recovered){
        try{
            db.each('SELECT id, content FROM messages WHERE id > ?',
                [socket.handshake.auth.severOffset || 0],
                (_err, row) => {
                    socket.emit('chat message', row.content, row.id);
                }
            );
        } catch (e){
            console.log("Something goes wrong");
        }
    }
});
