// Express
import express from 'express';

// Things of node
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Socketio
import { Server } from 'socket.io';

// SQLite
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Database
import { db, db_delete_message, db_add_message } from './private/db.js';

//
const app = express();
const server = createServer(app);
const io = new Server(server,{
    connectionStateRecovery:{}
});
const __dirname = dirname(fileURLToPath(import.meta.url));

await db.exec(`
CREATE TABLE IF NOT EXISTS message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_offset TEXT UNIQUE,
    content TEXT
);`
);

// App route
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    // console.log(__dirname);
    res.sendFile(join(__dirname+'/public/index.html'));
});

// Init server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Server up");
});

// Server operations
io.on('connection', async (socket) => {
    socket.on('chat delete', async () => {
        db_delete_message();
        io.emit('chat delete');
    });

    socket.on('chat message', async (msg, client_offset) => {
        let result;
        try {
            result=await db_add_message(msg, client_offset);
        } catch (e){
            return;
        }

        // console.log('message: '+msg);
        io.emit('chat message', msg, result.lastID);
    });


    if(!socket.recovered){
        try{
            db.each('SELECT id, content FROM message WHERE id > ?',
                [socket.handshake.auth.serverOffset || 0],
                (_err, row) => {
                    socket.emit('chat message', row.content, row.id);
                }
            );
        } catch (e){
            console.log("Something goes wrong");
        }
    }
});
