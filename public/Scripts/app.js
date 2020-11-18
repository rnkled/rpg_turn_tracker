class App {

    constructor() {

        this.socket = io();

        this.room = this.getRoom();

        this.name = sessionStorage.getItem('name');
        this.gm = sessionStorage.getItem('gm');
        this.dice = 20;
        this.current = 0;
        this.current_entity;
        this.notes = {};
        this.edit = false;
        this.get_notes();
        this.get_data();
        this.set_input_chat();
        this.fields_define();

        if(this.gm && (Object.keys(this.data).length === 0)){
            this.brute_data = JSON.parse(sessionStorage.getItem("brute_data"));
        
            this.data = this.roll();
            this.sort_Data();
        }

        this.socket_hello();     
        this.socket.on('data_init', (data) => {this.set_data(data)});
        this.socket.on('update', (data) => {this.receive_update(data)});
        this.socket.on('edit_on', ()=>{this.edit_on()});
        this.socket.on('edit_off', ()=>{this.edit_off()});
        this.socket.on('chat_update', (message) => {this.add_message(message['author'], message['message'])})
        this.socket.on('current_update', (current) => {this.set_current(current)});
        this.socket.on('show_image', (img) => {this.display_image(img)})
        this.socket.on('error', () => {window.location.assign("./lobby");});
        
    }

    getRoom(){
        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);
        return urlParams.get('room');
    }
    
    socket_hello(){
        if(this.gm){
            this.socket.emit('DM_hello', {'name':this.name, 'room':this.room});
            this.socket.emit('data_update', this.data);
        }else{
            this.socket.emit('hello', {'name':this.name, 'room':this.room});}
    }

    sort_Data(){
        this.data = this.bubbleSort(this.data).reverse();
        this.update_cells();
        this.make_table();
    }

    roll_dice() {
        return Math.floor(Math.random() * this.dice) + 1;
    }

    roll() {
        let array = [];
        let id_n = 0;
        this.brute_data.forEach((object) => {
            
            let roll = this.roll_dice();
            let mod = parseInt(object['Modifier']);
            let obj = {
                "name": object['Name'],
                "mod": mod,
                "roll": roll,
                "initiative": roll + mod,
                "id": Date.now()+id_n
            };
            array.push(obj);
            id_n += 1
        })
        return array;
    }


    bubbleSort(arr){
        var len = arr.length;
        for (var i = len-1; i>=0; i--){
          for(var j = 1; j<=i; j++){
            if(arr[j-1]['initiative']>arr[j]['initiative']){
                var temp = arr[j-1];
                arr[j-1] = arr[j];
                arr[j] = temp;
            }
            if(arr[j-1]['initiative']==arr[j]['initiative']){
                if (arr[j-1]['mod']>arr[j]['mod']){
                    var temp = arr[j-1];
                    arr[j-1] = arr[j];
                    arr[j] = temp;}
            }
          }
        }
        return arr;
    }

    update_cells(){
        try {
            let length = this.data.length-1;
            let prev = this.current - 1;
            let next = this.current + 1;

            if(prev < 0){
                prev = length;
            }
            if(next > length){
                next = 0;
            }

            let prevName = document.getElementById('cell_name_prev');
            let iniPrev = document.getElementById('ini_prev')
            let descPrev = document.getElementById('description_prev')
            prevName.innerText = this.data[prev]['name'];
            iniPrev.innerText = this.data[prev]['initiative'];
            descPrev.innerText = format_desc(this.check_string(this.data[prev]['description']));
            
            let currentName = document.getElementById('cell_name_current');
            let iniCurrent = document.getElementById('ini_current')
            let descCurrent = document.getElementById('description_current')
            currentName.innerText = this.data[this.current]['name'];
            iniCurrent.innerText = this.data[this.current]['initiative'];
            descCurrent.innerText = format_desc(this.check_string(this.data[this.current]['description']));
            
            let nextName = document.getElementById('cell_name_next');
            let iniNext = document.getElementById('ini_next')
            let descNext = document.getElementById('description_next')
            nextName.innerText = this.data[next]['name'];
            iniNext.innerText = this.data[next]['initiative'];
            descNext.innerText = format_desc(this.check_string(this.data[next]['description']));

            function format_desc(desc){
            if(desc){
                return ('“' + desc + '”')
            } else { 
                return null};
            }

            let prevHPbar = document.getElementById('c_hp_prev');
            let currentHPbar = document.getElementById('c_hp_current');
            let nextHPbar = document.getElementById('c_hp_next');
            
            if(this.data[prev]['hidden'] != true){
                prevHPbar.style.width = checkBar(parseInt(parseInt(this.data[prev]['cPv']) / parseInt(this.data[prev]['tPv']) * 100)+'%')
                prevHPbar.style.backgroundColor = 'rgb(161, 6, 6)';
            } else {
                prevHPbar.style.width = '100%'
                prevHPbar.style.backgroundColor = "rgb(54, 3, 3)"
            }
            
            
            if(this.data[this.current]['hidden'] != true){
                currentHPbar.style.width = checkBar(parseInt(parseInt(this.data[this.current]['cPv']) / parseInt(this.data[this.current]['tPv']) * 100)+'%')
                currentHPbar.style.backgroundColor = 'rgb(161, 6, 6)';
            } else {
                currentHPbar.style.width = '100%'
                currentHPbar.style.backgroundColor = "rgb(54, 3, 3)"
            }
            
            if(this.data[next]['hidden'] != true){
                nextHPbar.style.width = checkBar(parseInt(parseInt(this.data[next]['cPv']) / parseInt(this.data[next]['tPv']) * 100)+'%')
                nextHPbar.style.backgroundColor = 'rgb(161, 6, 6)';
            } else {
                nextHPbar.style.width = '100%'
                nextHPbar.style.backgroundColor = "rgb(54, 3, 3)"
            }

        } catch (error) {
            console.log(error);
            alert('Sorry! There as Problem loading Data, please Refresh page!');
            window.location.assign("./lobby");
        }

        function checkBar(value){
            if(value === 'NaN%'){
                return '100%';
            }else{
                return value;
            }
        }



    }
    
    previous(){
        if(this.current == 0){
            this.current = this.data.length-1;
        } else {
            this.current -= 1;
        }
        this.socket.emit('send_current', this.current);
        this.update_cells();
        this.make_table();
    }

    next(){
        if(this.current == this.data.length-1){
            this.current = 0;
        } else {
            this.current += 1;
        }
        this.socket.emit('send_current', this.current);
        this.update_cells();
        this.make_table();
    }

    make_table(){
        let table = document.getElementById("entitys-table");

        while(table.rows.length > 1) {
            table.deleteRow(1);
        }

        for(let i = this.data.length-1; i>=0; i--){
            let row = table.insertRow(1);
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            cell1.innerHTML = this.data[i]["name"];
            cell2.innerHTML = this.data[i]["initiative"];

            row.onclick = () => {
                this.current_entity = this.data[i];
                this.show_selected(this.current_entity);
            }

            if(this.current == i){
                row.style.backgroundColor="rgba(57, 57, 57, 0.456)"
                this.current_entity = this.data[i];
                this.show_selected(this.current_entity);
            }

        }

    }

    show_selected(entity){
        let name = document.getElementById('name');
        let ac = document.getElementById('AC');
        let initiative = document.getElementById('initiative');
        let pAttack = document.getElementById('pAttack');
        let cPv = document.getElementById('cPv');
        let tPv = document.getElementById('tPv');
        let description = document.getElementById('description');
        let notes = document.getElementById('notes');
        let hidden = document.getElementById('hidden');

        name.value = this.check_string(entity['name']);
        ac.value = this.check_string(entity['ac']);
        initiative.value = this.check_string(entity['initiative']);
        pAttack.value = this.check_string(entity['pAttack']);
        cPv.value = this.check_string(entity['cPv']);
        tPv.value = this.check_string(entity['tPv']);
        description.value = this.check_string(entity['description']);
        hidden.checked = entity['hidden'];

        notes.value = this.check_string(this.notes[entity['id']]);

        if (hidden.checked == true) {
            let bcolor = 'rgb(153, 152, 152)';
            pAttack.style.backgroundColor = bcolor;
            ac.style.backgroundColor = bcolor;
            cPv.style.backgroundColor = bcolor;
            tPv .style.backgroundColor = bcolor;

            if(!this.gm){
                ac.style.pointerEvents = 'none';
                pAttack.style.pointerEvents = 'none';
                cPv.style.pointerEvents = 'none';
                tPv.style.pointerEvents = 'none';
            }
        } else {
            
            pAttack.style.backgroundColor = "white";
            ac.style.backgroundColor = "white";
            cPv.style.backgroundColor = "white";
            tPv .style.backgroundColor = "white";

            if(this.edit == true){
            ac.style.pointerEvents = 'auto';
            pAttack.style.pointerEvents = 'auto';
            cPv.style.pointerEvents = 'auto';
            tPv.style.pointerEvents = 'auto';
            }
        }

    }

    check_string(value){
        if(value != undefined){
            return value;
        } else {
            return null;
        }
    }

    get_notes(){
        if(sessionStorage.getItem('notes')){
            this.notes = JSON.parse(sessionStorage.getItem('notes'))
        } else {
            this.notes = {}
        }
    }

    get_data(){
        if(sessionStorage.getItem('data')){
            this.data = JSON.parse(sessionStorage.getItem('data'))
            //this.update_cells();
            //this.make_table();
        } else {
            this.data = {}
        }
    }

    set_input_chat(){
        let input = document.getElementById("chat-text-box");
        input.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                app.send_chat();
        }
    });}

    display_image(img){
        let overlay = document.getElementById('overlay');
        overlay.classList.add('active');
        overlay.onclick = () => {
            overlay.classList.remove('active');
            overlay.innerHTML = '';
        }
        
        let img_overlay = document.createElement('div');
        img_overlay.classList.add('img-overlay');

        let img_element = document.createElement('img');
        img_element.setAttribute("src", img);


        img_overlay.appendChild(img_element);
        overlay.appendChild(img_overlay);
    }

    update_entity_notes(){
        let notes = document.getElementById('notes');
        this.notes[this.current_entity['id']] = notes.value;
        sessionStorage.setItem('notes', JSON.stringify(this.notes))
    }

    update_entity(){
        let name = document.getElementById('name');
        let ac = document.getElementById('AC');
        let initiative = document.getElementById('initiative');
        let pAttack = document.getElementById('pAttack');
        let cPv = document.getElementById('cPv');
        let tPv = document.getElementById('tPv');
        let description = document.getElementById('description');
        
        let hidden = document.getElementById('hidden');

        this.current_entity['ac'] = ac.value;
        this.current_entity['pAttack'] = pAttack.value;
        this.current_entity['cPv'] = cPv.value;
        this.current_entity['tPv'] = tPv.value;
        this.current_entity['description'] = description.value;
        this.current_entity['hidden'] = hidden.checked;
        
        if(this.current_entity['initiative'] != initiative.value){
            this.current_entity['initiative'] = initiative.value;
            this.sort_Data();
        }

        if(this.current_entity['name'].localeCompare(name.value) != 0){
            this.current_entity['name'] = name.value;
            this.make_table();
        }

        if(this.gm){sessionStorage.setItem('data', JSON.stringify(this.data));};
        this.show_selected(this.current_entity);
        this.update_cells();
        this.send_update();
    }

    add_new(){
        let new_entity = {
            name:'new Entity',
            initiative: this.data[this.data.length-1]['initiative']-1,
            mod: 0,
            id: Date.now()
        }
        this.data.push(new_entity);
        this.make_table();
        this.current_entity = new_entity;
        this.show_selected(this.current_entity);
        this.send_update();

        let scroll = document.getElementById('scroll-div')
        scroll.scrollTo(0, scroll.scrollHeight);
    }

    remove(){
        
        let index = this.data.indexOf(this.current_entity);
        
        this.data.splice(index, 1);
        this.make_table();
        this.update_cells();
    }

    send_update(){
        let sendData = Array.from(this.data);
        sendData.forEach(element => {
            if(element['hidden']){
                element['pAttack'] = null;
                element['ac'] = null;
                element['cPv'] = null;
                element['tPv'] = null;
            }
        })
        let data = sendData
        this.socket.emit('data_update', data);
    }

    receive_update(data){   
        if(data){
            this.data = data;
            this.update_cells();
            this.make_table();
        }
    }

    set_current(current){
        if(Number.isInteger(current)){
            this.current = current;
            this.update_cells();
            this.make_table();
        }
    }

    set_data(data){
        if(data){
            console.log(data);
            this.data = data['data'];
            this.set_chat(data['chat']);
            this.update_cells();
            this.make_table();
        }
    }

    set_chat(data){
        data.forEach((message) => {
            this.add_message(message['author'], message['message']);
        })
    }

    fields_define(){
        if(!sessionStorage.getItem('gm')){
            let name = document.getElementById('name');
            let ac = document.getElementById('AC');
            let initiative = document.getElementById('initiative');
            let pAttack = document.getElementById('pAttack');
            let pAttack_label = document.getElementById('pAttack_label');
            let cPv = document.getElementById('cPv');
            let tPv = document.getElementById('tPv');
            let description = document.getElementById('description');
            let notes = document.getElementById('notes');
            let hidden = document.getElementById('hidden');
            let hidden_label = document.getElementById('hidden_label');
            let buttons_row = document.getElementById('buttons_row');
            let div_hp = document.getElementById('div_hp');

            name.style.pointerEvents = 'none';
            ac.style.pointerEvents = 'none';
            initiative.style.pointerEvents = 'none';
            pAttack.style.pointerEvents = 'none';
            cPv.style.pointerEvents = 'none';
            tPv.style.pointerEvents = 'none';
            description.style.pointerEvents = 'none';
            hidden.style.pointerEvents = 'none';
            hidden.style.display = 'none';
            hidden_label.style.display = 'none';
            pAttack.style.display = 'none';
            pAttack_label.style.display = 'none';
            buttons_row.style.display = 'none';
            if(window.innerWidth>600){
            div_hp.style.left = '17vw'}
            notes.style.height = '50%'
        }
    }

    update_edit(){
        let allow = document.getElementById('allow');

        if(allow.checked){
            this.socket.emit('edit_on');
        } else {
            this.socket.emit('edit_off');
        }
    }

    edit_on(){
        let name = document.getElementById('name');
        let ac = document.getElementById('AC');
        let initiative = document.getElementById('initiative');
        let cPv = document.getElementById('cPv');
        let tPv = document.getElementById('tPv');
        let description = document.getElementById('description');

        name.style.pointerEvents = 'auto';
        initiative.style.pointerEvents = 'auto';
        description.style.pointerEvents = 'auto';
            
        if (hidden.checked == false) {
            ac.style.pointerEvents = 'auto';
            cPv.style.pointerEvents = 'auto';
            tPv.style.pointerEvents = 'auto';
        }
        this.edit = true;
    }

    edit_off(){
        let name = document.getElementById('name');
        let ac = document.getElementById('AC');
        let initiative = document.getElementById('initiative');
        let cPv = document.getElementById('cPv');
        let tPv = document.getElementById('tPv');
        let description = document.getElementById('description');

        name.style.pointerEvents = 'none';
        initiative.style.pointerEvents = 'none';
        description.style.pointerEvents = 'none';

        ac.style.pointerEvents = 'none';
        cPv.style.pointerEvents = 'none';
        tPv.style.pointerEvents = 'none';
        this.edit = false;
    
    }

    switch(){
        let table = document.getElementById('entitys-table');
        let chat = document.getElementById('chat');

        console.log('debug')
        console.log(table.style.display)
        console.log(chat.style.display)

        if(chat.style.display == 'block'){
            chat.style.display = 'none';
            table.style.display = "table"
        } else {
            chat.style.display = 'block';
            table.style.display = "none"
        }
    }

    add_message(author, message){
        let chat = document.getElementById('chat-scroll');
        let p = document.createElement('p');
        p.classList.add('chat-message');
        p.innerHTML = `<strong>${author}</strong>: ${message}`
        chat.appendChild(p);
        chat.scrollTo(0, chat.scrollHeight);
    }

    send_chat(){
        let input = document.getElementById("chat-text-box");
        let message = {};
        if(input.value != ""){
            message['author'] = this.name;
            message['message'] = input.value;
            input.value = "";
            this.socket.emit('chat_message', message);
            if(!(message['message'][0] == '/'))
            this.add_message(message['author'], message['message']);
        }
    }

}