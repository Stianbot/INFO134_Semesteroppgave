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

function Search(url, description){
    this.url = url;
    this.description = description;
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
            if (search_key[0] === data["elementer"][value]["kommunenummer"] ){
                data["elementer"][value].name = value;
                return data["elementer"][value]
            }
        }
    }
    if (search_key === null){
        throw "Feil: Skriv inn et gyldig kommunenummer"
    }
}

function overview(){
    let id_list = population.getIDs();
    let name_list = population.getNames();
    let total_population = calculate_population(population.data);
    for (let i = 0; i < id_list.length; i++) {
        let li = document.createElement("LI");
        li.appendChild(document.createTextNode(name_list[i]+", "+id_list[i]+", "+total_population[i]));
        document.getElementById("overview_list").appendChild(li);
    }
}

function calculate_population(data){
    let array = [];
    for(let value in data["elementer"]){
        let women = data["elementer"][value]["Kvinner"]["2018"];
        let man = data["elementer"][value]["Menn"]["2018"];
        array.push(women+man)
    }
    return array
}


let population = new Search(befolkning, "population");
let employed = new Search(sysselsatte, "employed");
let education = new Search(utdanning, "education");

function run() {
    population.load();
    employed.load();
    education.load();
}

window.onload = run();