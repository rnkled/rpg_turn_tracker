function create_room(room){
    let scrollDiv = document.getElementById('scroll-div');

    let divRoom = document.createElement('div');
    divRoom.classList.add('div-room');

    let mediaAdapter = document.createElement('div');
    mediaAdapter.classList.add('media-adapter');

    /*
    let players = document.createElement('label');
    players.classList.add('room-players');
    players.innerText = +room['players'];
    */
    let name = document.createElement('label');
    name.classList.add('room-name');
    name.innerText = room['name'];
    
    let dm = document.createElement('label');
    dm.classList.add('room-dm');
    dm.innerText = `Created by ${room['gm']}`;

    let button = document.createElement('button');
    button.onclick = () => {window.location.assign(`./app?room=${room['name']}`)};
    button.innerText = "Join";

    scrollDiv.appendChild(divRoom);
    divRoom.appendChild(mediaAdapter);
    //mediaAdapter.appendChild(players);
    mediaAdapter.appendChild(name);
    mediaAdapter.appendChild(dm);
    divRoom.appendChild(button);

}

function get_rooms(){
    let url='./get_rooms';
    request(url, show_rooms);
}

function show_rooms(response){
    rooms = JSON.parse(response.srcElement.responseText);
    Object.keys(rooms).forEach( room => {
        create_room(rooms[room]);
    })
}

function request(caminho, funcaoResposta, dados = null){
    try
    {   
        asyncRequest = new XMLHttpRequest();
        asyncRequest.open('POST', caminho, true);
        asyncRequest.onload = funcaoResposta; 
        asyncRequest.send(dados);
        
    }
    catch(exception)
    {
        alert("Request Falho!");
        console.log(exception);
    }
}