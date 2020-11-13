var selectedRow = null;

function addEntity() {
    let form = document.getElementById("addEntity");
    let data = Object.values(form).reduce((obj, field) => {
        obj[field.name] = field.value;
        return obj
    }, {});

    if(data['name'].length>0 && data['mod'].length>0){
        let table = document.getElementById("entitys-table");
        let row = table.insertRow(1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        cell1.innerHTML = data["name"];
        cell2.innerHTML = data["mod"];
        row.onclick = () => showSelected(row);

        document.getElementById("name").value = '';
        document.getElementById("mod").value = '';}
    else{
        alert("You need a Name and a Modifier to add an Entity.")
    }
}

function showSelected(row) {
    let name = row.getElementsByTagName("td")[0].innerHTML;
    let mod = row.getElementsByTagName("td")[1].innerHTML;
    selectedRow = row;

    let inptName = document.getElementById("edit-name");
    let inptMod = document.getElementById("edit-mod");

    inptName.value = name;
    inptMod.value = mod;
    showEditDiv();
};

function updateSelected() {
    let selectedCellName = selectedRow.getElementsByTagName("td")[0];
    let selectedCellMod = selectedRow.getElementsByTagName("td")[1];

    let NewinptName = document.getElementById("edit-name");
    let NewinptMod = document.getElementById("edit-mod");

    console.log(NewinptName.value);
    console.log(NewinptMod.value);

    selectedCellName.innerHTML = NewinptName.value;
    selectedCellMod.innerHTML = NewinptMod.value;
    
    hideEditDiv();
}

function deleteSelected() {

    let table = document.getElementById("entitys-table");
    let selectedCellName = selectedRow.getElementsByTagName("td")[0];
    table.deleteRow(selectedRow.rowIndex);
    hideEditDiv();
}

function showEditDiv() {
    let tip = document.getElementById("select-tip");
    let div = document.getElementById("select-edit");
    if (div.style.display = 'none') {
        tip.style.display = 'none';
        div.style.display = 'block';
    }

}

function hideEditDiv() {
    let tip = document.getElementById("select-tip");
    let div = document.getElementById("select-edit");
    if (div.style.display = 'block') {
        div.style.display = 'none';
        tip.style.display = 'block';
    }
}

function roll(){

    let table = document.getElementById("entitys-table");
    let brute_data = tableToObj(table);

    if(brute_data.length > 0){
        sessionStorage.setItem('brute_data', JSON.stringify(brute_data));
        sessionStorage.setItem('gm', true);
        //window.location.assign('./app.html')
    } else {
        alert("Add entitys to continue!")
    }
}

function tableToObj(table) {
    var rows = table.rows;
    var propCells = rows[0].cells;
    var propNames = [];
    var results = [];
    var obj, row, cells;
  
    for (var i=0, iLen=propCells.length; i<iLen; i++) {
      propNames.push(propCells[i].textContent || propCells[i].innerText);
    }
  
    for (var j=1, jLen=rows.length; j<jLen; j++) {
      cells = rows[j].cells;
      obj = {};
  
      for (var k=0; k<iLen; k++) {
        obj[propNames[k]] = cells[k].textContent || cells[k].innerText;
      }
      results.push(obj)
    }
    return results;
  }