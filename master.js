function urls(){
    let befolkning = "http://wildboy.uib.no/~tpe056/folk/104857.json";
    let sysselsatte = "http://wildboy.uib.no/~tpe056/folk/100145.json";
    let utdanning = "http://wildboy.uib.no/~tpe056/folk/85432.json";
    return [befolkning,sysselsatte,utdanning]
}


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
    let search_key =regex_check(id);
    if (search_key !== null){
        for (let value in data["elementer"]){
            if (search_key === data["elementer"][value]["kommunenummer"] ){
                data["elementer"][value].name = value;
                return data["elementer"][value]
            }
        }
    }
    if (search_key === null){
        throw "Feil: Skriv inn et gyldig kommunenummer"
    }
}

function regex_check(id) {
    let regex = /\d{4}/;
    return id.match(regex)[0];
}

function overview(population){
    let placement = document.getElementById("overview_list");
    while (placement.firstChild){
        placement.removeChild(placement.firstChild)
    }

    let list = [];
    let id_list = population.getIDs();
    let name_list = population.getNames();
    let total_population = calculate_population(population.data);
    for (let i = 0; i < id_list.length; i++) {
        let li = document.createElement("LI");
        li.appendChild(document.createTextNode(name_list[i]+", "+id_list[i]+", "+total_population[i]));
        placement.appendChild(li);
        list.push([name_list[i],id_list[i],total_population[i]])
    }
    return list
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

function get_population_details(data){
    let input = regex_check(document.getElementById("input").value);
    if (input !== null){
        let result = data.getInfo(input);
        let total_population = result["Kvinner"]["2018"]+ result["Menn"]["2018"];
        return {name:result.name, id:result.kommunenummer,total_population:total_population};


    }
    if (input === null){
        throw "Feil: Skriv inn et gyldig kommunenummer"
    }
}

function get_employed_details(data) {
    let input = regex_check(document.getElementById("input").value);
    if (input !== null){
        let result = data.getInfo(input);
        return result["Begge kjønn"]["2018"];
    }

}

function calculate_educated(data){
    let man_short = data["03a"]["Menn"]["2017"];
    let man_long = data["04a"]["Menn"]["2017"];
    let woman_short = data["03a"]["Kvinner"]["2017"];
    let woman_long = data["04a"]["Kvinner"]["2017"];
    let result = {
        man_short:man_short,
        man_long:man_long,
        man_total:man_short+man_long,
        woman_short:woman_short,
        woman_long:woman_long,
        woman_total:woman_short+woman_long
    };
    result.total = result.man_total + result.woman_total;
    return result
}

function get_education_details(data){
    let input = regex_check(document.getElementById("input").value);
    if (input !== null){
        let result = data.getInfo(input);
        return calculate_educated(result);
    }
}

function details(pop,emp,edu){
    let pop_data = get_population_details(pop);
    let emp_data = get_employed_details(emp);
    let edu_data = get_education_details(edu);

    let result = "[navn: "+pop_data.name+"] [id: "+pop_data.id+"] [populasjon: "+pop_data.total_population+"] [%ansatt: "+ emp_data + "] [ansatt: " + calculate_amount(pop_data.total_population,emp_data) + "] " + "[%utdannet: " + edu_data.total+"] [utdannet:" + calculate_amount(pop_data,edu_data.total)+"]";



    document.getElementById("details_data").appendChild(document.createTextNode(result));
}

function calculate_amount(number,percentage) {
return parseInt((number/100)*percentage)
}


function program() {
    let population = new Search(urls()[0], "population");
    let employed = new Search(urls()[1], "employed");
    let education = new Search(urls()[2], "education");
    population.load();
    employed.load();
    education.load();

    document.getElementById("overview_button").addEventListener("click",function () {
        overview(population)
    });

    document.getElementById("details_button").addEventListener("click", function () {

        details(population,employed,education)
    });
}



