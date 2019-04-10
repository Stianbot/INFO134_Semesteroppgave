let befolkning = "http://wildboy.uib.no/~tpe056/folk/104857.json";
let sysselsatte = "http://wildboy.uib.no/~tpe056/folk/100145.json";
let utdanning = "http://wildboy.uib.no/~tpe056/folk/85432.json";

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

function Search(url){
    this.url = url;
    this.getNames = function(){if(this.data){return getNames(this.data)}};
    this.getIDs = function(){if(this.data){return getIDs(this.data)}};
    this.getInfo = function(id){if(this.data){return getInfo(this.data, id)}};
    this.load = function(){load(this.url, this.onload, this)};
    this.onload = null;
}

function load(url,callback, object){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
            object.data = JSON.parse(xhr.responseText);

            if (callback){
                callback(object.data);
            }
        }

    };
    xhr.send()
}

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

function getInfo(data, id){
    let regex = /\d{4}/;
    let search_key = id.match(regex);
    if (search_key !== null){
        for (let value in data["elementer"]){
            let value_1 = search_key[0];
            let value_2 = data["elementer"][value];
            if (value_1 === value_2["kommunenummer"] ){
                return value_2
            }
        }
    }
    if (search_key === null){
        throw "Feil: Skriv inn et gyldig kommunenummer"
    }
}


let population = new Search(befolkning);
let employed = new Search(sysselsatte);
let education = new Search(utdanning);

function run() {
    population.load();
    employed.load();
    education.load();
}

window.onload = run();