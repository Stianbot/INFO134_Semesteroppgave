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

function Search(url, onload){
    this.url = url;
    this.getNames = function(){if(this.data){return getNames(this.data)}};
    this.getIDs = function(){if(this.data){return getIDs(this.data)}};
    this.getInfo = function(id){if(this.data){return getInfo(this.data, id)}};
    this.load = function(){load(this.url, this.onload, this)};
    this.onload = onload||null;
}

function load(url, callback, object){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
            object.data = JSON.parse(xhr.responseText);

            if (callback){
                callback();
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
    let search_key = regex_check(id);
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
    let id_list = population.getIDs();
    let name_list = population.getNames();
    let total_population = calculate_population(population.data);
    for (let i = 0; i < id_list.length; i++) {
        let li = document.createElement("LI");
        li.appendChild(document.createTextNode("[navn: "+name_list[i]+"] [id: "+id_list[i]+"] [populasjon: "+total_population[i]+"]"));
        placement.appendChild(li);
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
    let pop_data_result = "[navn: "+pop_data.name+"] [id: "+pop_data.id+"] [populasjon: "+pop_data.total_population+"] ";
    let emp_data_result = "[%ansatt: "+emp_data+"] [ansatt: "+calculate_amount(pop_data.total_population,emp_data)+"] ";
    let edu_data_result = "[%utdannet: " + edu_data.total+"] [utdannet: "+calculate_amount(pop_data.total_population,edu_data.total)+"]";
    let result =  pop_data_result + emp_data_result + edu_data_result;
    document.getElementById("details_data").appendChild(document.createTextNode(result));
    historic_development(pop,emp,edu)
}

function calculate_amount(number,percentage) {
return parseInt((number/100)*percentage)
}

function alterBtn(bool) {
    let btn = document.getElementsByTagName("button");
    for (let i = 0; i < btn.length ; i++) {
        btn[i].disabled = bool
    }
}

function loadingScreen() {
    document.getElementById("loading").style.display = "none";
}

function historic_development(pop,emp,edu) {
    let input = regex_check(document.getElementById("input").value);
    let pop_data = pop.getInfo(input);
    let emp_data = emp.getInfo(input);
    let edu_data = edu.getInfo(input);

    trim_and_place(pop_data,"Menn","pop_man");
    trim_and_place(pop_data,"Kvinner", "pop_women");

    trim_and_place(emp_data,"Menn", "emp_man");
    trim_and_place(emp_data,"Kvinner", "emp_women");

    trim_and_place(edu_data,"Menn","edu_01_man", "01");
    trim_and_place(edu_data,"Kvinner", "edu_01_women", "01");

    trim_and_place(edu_data,"Menn", "edu_02a_man", "02a");
    trim_and_place(edu_data,"Kvinner", "edu_02a_women", "02a");

    trim_and_place(edu_data,"Menn", "edu_03a_man", "03a");
    trim_and_place(edu_data,"Kvinner", "edu_03a_women", "03a");

    trim_and_place(edu_data,"Menn", "edu_04a_man", "04a");
    trim_and_place(edu_data,"Kvinner", "edu_04a_women", "04a");

    trim_and_place(edu_data,"Menn", "edu_09a_man", "09a");
    trim_and_place(edu_data,"Kvinner", "edu_09a_women", "09a");

    trim_and_place(edu_data,"Menn", "edu_11_man", "11");
    trim_and_place(edu_data,"Kvinner", "edu_11_women", "11");
}

function trim_and_place(data,gender,id,edu, extra_text) {
    if (edu === undefined){
        let trimmed = trim(JSON.stringify(data[gender])).split(",");
        placeHTML(id,trimmed, extra_text)
    } if (edu){
        let trimmed = trim(JSON.stringify(data[edu][gender])).split(",");
        placeHTML(id,trimmed,extra_text)
    }
}

function trim(text) {
    return text.replace(/[^a-zA-Z0-9.,:\s*]/g, "");
}

function placeHTML(id, data, extra_text) {
    let placement = document.getElementById(id);
    for (let i = 0; i < data.length; i++) {
        if (extra_text !== undefined){
            let text = document.createTextNode(data[i]+ " "+ extra_text[i]);
            let b = document.createElement("li");
            b.appendChild(text);
            placement.appendChild(b);
        }
        if (extra_text === undefined){
            let text = document.createTextNode(data[i]);
            let b = document.createElement("li");
            b.appendChild(text);
            placement.appendChild(b);
        }

    }
}
function placeTitle(id,data) {
    let placement = document.getElementById(id);
    let text = document.createTextNode(data);
    placement.appendChild(text)
}

function compare(pop,emp,edu) {
    let mun_1 = regex_check(document.getElementById("comp_1").value);
    let mun_2 = regex_check(document.getElementById("comp_2").value);
    let emp_mun_1 = emp.getInfo(mun_1);
    let emp_mun_2 = emp.getInfo(mun_2);

    let mun_1_growth = com_data(emp_mun_1,"Menn");
    let mun_2_growth = com_data(emp_mun_2, "Menn");

    let resulatat = compare_growth(mun_1_growth,mun_2_growth);
    console.log(resulatat)

    placeTitle("mun_1_man", emp_mun_1.name+" Menn");
    placeTitle("mun_2_man", emp_mun_2.name+" Menn");

    trim_and_place(emp_mun_1,"Menn", "mun_1_liste", undefined, resulatat[0]);
    trim_and_place(emp_mun_2,"Menn", "mun_2_liste", undefined, resulatat[1]);

}

function com_data(data,gender) {
    let d1 = [];
    for (let x in data[gender]){
        if (x == 2005){
            d1.push("0")
        }

        if (x > 2005){
            let temp = data[gender][x] - data[gender][x-1];
            d1.push(temp);
        }

    }
    return d1
    
}

function compare_growth(data,data2) {
    let array = [];
    let array2 = [];
    for (let i = 0; i <data.length ; i++) {
        if (data[i] > data2[i]){
            array.push("Høyest vekst " + data[i].toFixed(1));
            array2.push("Minst vekst " + data2[i].toFixed(1))
        }
        if (data[i] < data2[i]){
            array2.push("Høyest vekst " + data2[i].toFixed(1));
            array.push("Minst vekst " + data[i].toFixed(1))
        }
        if (data[i] === data2[i]){
            array.push("Utgangspunkt");
            array2.push("Utgangspunkt");
        }
    }
    return [array,array2]
}

function prep() {
    alterBtn(true);
    let population = new Search(urls()[0], function(){employed.load()});
    let employed = new Search(urls()[1], function () {education.load()});
    let education = new Search(urls()[2], function () {alterBtn(false);loadingScreen()});
    population.load();
    
    document.getElementById("btn_2").addEventListener("click",function () {
        overview(population)
    });

    document.getElementById("details_button").addEventListener("click", function () {
        details(population,employed,education)
    });

    document.getElementById("compare_button").addEventListener("click", function () {
        compare(population,employed,education)
    })
}

