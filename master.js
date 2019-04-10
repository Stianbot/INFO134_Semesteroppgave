function get(id) {
    return document.getElementById(id)
}
function alterDiv(number) {
    let array = [get("intro"),get("overview"),get("details"), get("compare")];
    for (let i = 0; i < array.length; i++) {
        array[i].className = "hidden"
    }

    if (number !== undefined && number <= array.length) {
        array[number].className = "visible"
    }
}

function Population(url){
    this.url = url;
    this.getNames = function(){if(this.data){return getNames(this.data)}};
    this.getIDs = function(){if(this.data){return getIDs(this.data)}};
    this.load = function(){load(this.url, this.onload, this)};
    this.onload = null;
    this.resultat = {befolkning: null}
}

function load(url,callback, objekt){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
            objekt.data = JSON.parse(xhr.responseText);

            if (callback){
                callback(response);
            }
        }

    };
    xhr.send()
}

//load("http://wildboy.uib.no/~tpe056/folk/104857.json");

function getNames(data){
    let array = [];
    for (let municipality in data.elementer){
        array.push(municipality)
    }
    return array
}

function getIDs(data){
    let array = [];
    for (let municipality in data["elementer"]){
        array.push(data["elementer"][municipality]["kommunenummer"])
    }
    return array
}


let x = new Population("http://wildboy.uib.no/~tpe056/folk/104857.json");

window.onload = x.load();