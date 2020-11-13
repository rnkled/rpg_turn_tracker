var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Roll = require('roll');
var roll = new Roll();

app.use(express.static('public'));
app.use(bodyParser.json());

var data = {};
var chat = [];

io.on('connection', socket => {
    console.log(`Socket Connectado: ${socket.id}`);

    socket.on('data_update', received_data => {
        data = received_data;
        socket.broadcast.emit('update', data);
    })

    socket.on('hello', name => {
        socket.emit('data_init', {'data': data, 'chat':chat});
        socket.broadcast.emit('chat_update', {'author':'<>','message':`${name} joins chat.`})
    })

    socket.on('edit_on', () => {
        socket.broadcast.emit('edit_on');
    })

    socket.on('edit_off', () => {
        socket.broadcast.emit('edit_off');
    })

    socket.on('chat_message', received_data => {
        chat.push(received_data);
        socket.broadcast.emit('chat_update', received_data);
        check_comando(received_data);
    })
})


server.listen(8888, () => {
    console.log('Backend Iniciado!')
});


function check_comando(message){
    if(message['message'][0] == "/"){
        try {
            let strings = message['message'].split(" ");
            let roll_string = strings[1];
            let result = roll.roll(roll_string);
            let log = `<i><span class="span_chat">${message['author']} rolls ${strings[1]}: </span><strong>${result.result}</strong> <span class="span_chat">[${result.rolled}]</span></i>`
            let roll_data = {'author':'<>', 'message':log};
            chat.push(roll_data);
            io.emit('chat_update', roll_data);    
        } catch (error) {
            let string = "Sorry, there was a problems with the Roll. Try again"
            let roll_data = {'author':'<>', 'message':string};
            chat.push(roll_data);
            io.emit('chat_update', roll_data);
        }
        
    }
}