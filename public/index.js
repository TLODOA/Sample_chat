const INPUT_BOX=document.getElementById("input_message");

const OUTPUT_BOX=document.getElementById("output_message");
const OUTPUT_BOX_TEMP=document.getElementById("output_message_temp");

const form=document.getElementById("form_message");

const TIMEOUT=1000;
const RETRIES=3;

let socket_id=crypto.getRandomValues(new Uint32Array(1))[0];
let counter=0;

//

const socket=io({
    auth: {
        serverOffset: 0
    },
    // ackTimeout:TIMEOUT,
    // retries:RETRIES,
});

/* I don't understand nothing of this timeout 
function emit(socket, event, args, retries=RETRIES){
    if(!retries)
        return;
    console.log(retries);
    socket.timeout(TIMEOUT).emit(event, args , (err) => {
        if(err){
            console.log(err,retries);
            emit(socket, event, args, retries-1);
        }
    });
}
*/ 

socket.on('chat message', (msg, serverOffset) => {
    OUTPUT_BOX_TEMP.innerHTML="";
    OUTPUT_BOX.innerHTML = msg+'<br>'+OUTPUT_BOX.innerHTML;
    // console.log(serverOffset);
    socket.auth.serverOffset = serverOffset;
});

socket.on('chat delete', () => {
    OUTPUT_BOX.innerHTML = '';
    OUTPUT_BOX_TEMP.innerHTML = '';
    socket.auth.serverOffset = 0;
});

// Disable/enable the connection
const button_connection=document.getElementById("button_connection");
button_connection.addEventListener('click', (e)=>{
    e.preventDefault();
    if(socket.connected){
        button_connection.innerHTML='Connect';
        socket.disconnect();
        return;
    }

    button_connection.innerHTML='Disconnect';
    socket.connect();
});

// Erase all data
const button_erase=document.getElementById("button_erase");
button_erase.addEventListener('click', (e)=>{
    e.preventDefault();

    OUTPUT_BOX.innerHTML='';
    OUTPUT_BOX_TEMP.innerHTML = '';

    socket.emit('chat delete');
});

// Send message
form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!INPUT_BOX.value){
        return;
    }

    const client_offset=`${socket_id}-${counter}`;
    socket.emit('chat message', INPUT_BOX.value, client_offset);
    // emit(socket, 'chat message', [INPUT_BOX.value, client_offset], RETRIES);

    OUTPUT_BOX_TEMP.innerHTML = INPUT_BOX.value+'<br>'+OUTPUT_BOX_TEMP.innerHTML;
    INPUT_BOX.value='';

    ++counter;
});
