import sqlite3 from 'sqlite3'
import { open } from 'sqlite';

const db = await open({
    filename : 'chat.db',
    driver: sqlite3.Database
});


function db_delete_message(){
    db.run('DELETE FROM message', (err) => {
        if(!err)
            return;

        console.log(err);
    });
}

function db_add_message(msg, client_offset){
    let result
    // console.log(client_offset);
    try {
        result=db.run('INSERT INTO message (content, client_offset) VALUES (?, ?)', msg, client_offset);
    } catch(e){
        console.log("Insert message error");
        return result;
    }

    return result;
}

export { db };
export { db_delete_message };
export { db_add_message };
