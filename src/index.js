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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/index.html'));
});

app.get('/lobby', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/lobby.html'));
});

app.get('/setup', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/setup.html'));
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/app.html'));
});

app.post('/get_rooms', (req, res) => {
    
    let roomsObject = io.sockets.adapter.rooms;
    
    let data = {};

    roomsObject.forEach((sockets, key) => {
            if(key[0] == '#'){
                let name = key;
                data[name.substring(1)] = {
                    'name': name.substring(1),
                    'gm' : rooms[name]['gm'],
                    'players': sockets.size}
                }
    });

    res.json(data);
});


var rooms = {};

io.on('connection', socket => {
    console.log(`Socket Connectado: ${socket.id}`);

    socket.on('hello', (data) => {
        try {
            validate(socket, data);
            socket.join("#"+data['room']);
            
            socket.room_name = "#"+data['room'];
            socket.name = data['name'];

            socket.emit('data_init', {'data': rooms[socket.room_name]['data'], 'chat':rooms[socket.room_name]['chat']});
            socket.to(socket.room_name).emit('chat_update', {'author':'<>','message':`${socket.name} joins chat.`});
            
            console.log(`${socket.name} Connected to ${socket.room_name}`);   
        } catch (error) {
            console.log(error);
        }
        
    });

    socket.on('DM_hello', (data) => {
        try {
            validate(socket, data);
            socket.join("#"+data['room']);
            
            socket.room_name = "#"+data['room'];
            socket.name = data['name'];

            rooms[socket.room_name] = {};

            rooms[socket.room_name]['data'] = {};
            if(!rooms[socket.room_name]['chat']){
                rooms[socket.room_name]['chat'] = [];}
            rooms[socket.room_name]['gm'] = socket.name;

            socket.to(socket.room_name).emit('chat_update', {'author':'<>','message':`[DM] ${socket.name} joins chat.`});

            console.log(`[DM] ${socket.name} Connected to ${socket.room_name}`);    
        } catch (error) {
            console.log(error);
        }
    });

    
    socket.on('data_update', received_data => {
        rooms[socket.room_name]['data'] = received_data;
        socket.to(socket.room_name).emit('update', rooms[socket.room_name]['data']);
    });

    socket.on('edit_on', () => {
        socket.to(socket.room_name).emit('edit_on');
    });

    socket.on('edit_off', () => {
        socket.to(socket.room_name).emit('edit_off');
    });

    socket.on('chat_message', received_data => {
        rooms[socket.room_name]['chat'].push(received_data);
        socket.to(socket.room_name).emit('chat_update', received_data);
        check_comando(received_data, socket);
    });

    socket.once('disconnect', () =>{
        io.to(socket.room_name).emit('chat_update', {'author':'<>','message':`${socket.name} exits chat.`});
        console.log(`${socket.name} Disconnected`);
    });
});



server.listen(process.env.PORT || 8888, () => {
    console.log(`Express server listening on port ${server.address().port} in ${app.settings.env} mode`)
});


function check_comando(message, socket){
    if(message['message'][0] == "/"){
        try {
            let strings = message['message'].split(" ");
            let roll_string = strings[1];
            let result = roll.roll(roll_string);
            let log = `<i><span class="span_chat">${message['author']} rolls ${strings[1]}: </span><strong>${result.result}</strong> <span class="span_chat">[${result.rolled}]</span></i>`
            let roll_data = {'author':'<>', 'message':log};
            rooms[socket.room_name]['chat'].push(roll_data);
            io.to(socket.room_name).emit('chat_update', roll_data);    
        } catch (error) {
            let string = "Sorry, there was a problems with the Command. Try again"
            let roll_data = {'author':'<>', 'message':string};
            rooms[socket.room_name]['chat'].push(roll_data);
            io.to(socket.room_name).emit('chat_update', roll_data);
        }
        
    }
}

function validate(socket, data){
    if(!data['name'] || !data['room']){
        console.log("Invalid State, Disconnected!")
        socket.disconnect();
    }
}