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

function db_add_message(msg){
    let result
    try{
        result=db.run('INSERT INTO message (content) VALUES (?)',msg);
    } catch(e){
        console.log("Insert message error");
        return -1;
    }

    return result;
}

export { db };
export { db_delete_message };
export { db_add_message };
