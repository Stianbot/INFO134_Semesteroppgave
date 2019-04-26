/*Funksjon for lagring av url-er til de ulike datasettene.*/
function urls(){
    let befolkning = "http://wildboy.uib.no/~tpe056/folk/104857.json";
    let sysselsatte = "http://wildboy.uib.no/~tpe056/folk/100145.json";
    let utdanning = "http://wildboy.uib.no/~tpe056/folk/85432.json";
    return [befolkning,sysselsatte,utdanning]
}

/*Funksjon som henter et element basert på id.*/
function get(id) {
    return document.getElementById(id)
}

/*Funksjon for å vise og skjule elementer. Viser elementet som har index lik 'number' i parameter*/
function alterDiv(number) {
    let array = [get("intro"),get("overview"),get("details"), get("compare")];
    for (let i = 0; i < array.length; i++) {
        array[i].className = "hidden"
    }

    if (number !== undefined && number <= array.length) {
        array[number].className = "visible"
    }
}

/*Konstruktør for et søkeobjekt som henter et datasett*/
function Search(url, onload){
    this.url = url;
    this.getNames = function(){if(this.data){return getNames(this.data)}};
    this.getIDs = function(){if(this.data){return getIDs(this.data)}};
    this.getInfo = function(id){if(this.data){return getInfo(this.data, id)}};
    this.load = function(){load(this.url, this.onload, this)};
    this.onload = onload||null;
}

/*Funksjon som henter et datasett. tar inn url, en callback funksjon og et objekt. Ment for bruk av Search.load()*/
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

/*Funksjon for å hente navn på alle kommuner i et datasett. Ment for bruk av Search.getNames()*/
function getNames(data){
    let array = [];
    for (let municipality in data.elementer){
        array.push(municipality)
    }
    return array
}

/*Funksjon for å hente kommunenummer til alle kommuner i et datasett. Ment for bruk av Search.getIDs()*/
function getIDs(data){
    let array = [];
    for (let municipality in data["elementer"]){
        array.push(data["elementer"][municipality]["kommunenummer"])
    }
    return array
}

/*Funksjon for å hente et kommune-objekt fra et datasett. Ment for bruk av Search.getInfo()*/
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

/*Funksjon som sjekker at input består av fire tall, returnerer de fire tallene eller null*/
function regex_check(id) {
    let regex = /\d{4}/g;
    return id.match(regex)[0];
}

/*Funksjon for å hente informajon som skal i Oversikt-delen av oppgaven*/
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

/*Funksjon som regner ut total befolkning ved å plusse sammen antall menn i 2018 med antall kvinner i 2018. returnerer en liste*/
function calculate_population(data){
    let array = [];
    for(let value in data["elementer"]){
        let women = data["elementer"][value]["Kvinner"]["2018"];
        let man = data["elementer"][value]["Menn"]["2018"];
        array.push(women+man)
    }
    return array
}

/*Funksjon for å hente ut navn, kommunenummer og total befolkning i en kommune, putter disse tre i et objekt og returnerer det*/
function get_population_details(data){
    let input = regex_check(document.getElementById("input").value);
    if (input !== null){
        let result = data.getInfo(input);
        let total_population = result["Kvinner"]["2018"]+ result["Menn"]["2018"];
        return {name:result.name, id:result.kommunenummer,total_population:total_population, total_men:result["Menn"]["2018"],total_women:result["Kvinner"]["2018"]};
    }
    if (input === null){
        throw "Feil: Skriv inn et gyldig kommunenummer"
    }
}

/*Funksjon for å hente ut data om ansatte i en kommune*/
function get_employed_details(data) {
    let input = regex_check(document.getElementById("input").value);
    if (input !== null){
        let result = data.getInfo(input);
        return result["Begge kjønn"]["2018"];
    }
}

/*Funksjon for å hente ut all data om høyere utdanning i en kommune, data blir lagt i et objekt og returnert*/
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

/*Funksjon for å hente ut utdanningsdetaljer/objektet til en kommune, baset på brukerinput(kommunenummer)*/
function get_education_details(data){
    let input = regex_check(document.getElementById("input").value);
    if (input !== null){
        let result = data.getInfo(input);
        return calculate_educated(result);
    }
}

/*Samlefunksjon for å hente inn og vise all data som er del av "detaljer"-delen av oppgaven*/
function details(pop,emp,edu){
    let placement = document.getElementById("details_data");
    while (placement.firstChild){
        placement.removeChild(placement.firstChild)
    }

    let pop_data = get_population_details(pop);
    let emp_data = get_employed_details(emp);
    let edu_data = get_education_details(edu);
    let calculate_edu = calculate(pop_data.total_men,edu_data.man_total) + calculate(pop_data.total_women,edu_data.woman_total)
    let pop_data_result = "[navn: "+pop_data.name+"] [id: "+pop_data.id+"] [populasjon: "+pop_data.total_population+"] ";
    let emp_data_result = "[%ansatt: "+emp_data+"] [ansatt: "+calculate(pop_data.total_population,emp_data)+"] ";
    let edu_data_result = "[%utdannet: " + calculate_2(calculate_edu,pop_data.total_population)+"] [utdannet: "+calculate_edu+"]";
    let result =  pop_data_result + emp_data_result + edu_data_result;
    document.getElementById("details_data").appendChild(document.createTextNode(result));
    historic_development(pop,emp,edu) //Henter historisk data.
}

/*Funksjon som regner ut antall av prosent. Ment for å finne antall ansatte/utdannede*/
function calculate(number, percentage) {
    return parseInt((number/100)*percentage)
}

function calculate_2(number, total){
    return parseInt((number*100)/ total)
}

/*Funksjon for å endre knapper, disable/enable basert på parameterverdien: bool*/
function alterBtn(bool) {
    let btn = document.getElementsByTagName("button");
    for (let i = 0; i < btn.length ; i++) {
        btn[i].disabled = bool
    }
}

/*Funksjon for å vise "laste-skjerm", denne vises til siste datasett er lastet inn*/
function loadingScreen() {
    document.getElementById("loading").style.display = "none";
}

/*Samlefunksjon for å vise all historisk data*/
function historic_development(pop,emp,edu) {
    let id_list = ["pop_man","pop_women","emp_man","emp_women","edu_01_man","edu_01_women","edu_02a_man","edu_02a_women","edu_03a_man","edu_03a_women","edu_04a_man","edu_04a_women","edu_09a_man","edu_09a_women","edu_11_man","edu_11_women"];
    for (let i=0; i<id_list.length; i++){
        let placement = document.getElementById(id_list[i]);
        while (placement.firstChild){
            placement.removeChild(placement.firstChild)
        }
    }

    let input = regex_check(document.getElementById("input").value);
    let pop_data = pop.getInfo(input);
    let emp_data = emp.getInfo(input);
    let edu_data = edu.getInfo(input);

    trim(pop_data,"Menn","pop_man");
    trim(pop_data,"Kvinner", "pop_women");

    trim(emp_data,"Menn", "emp_man");
    trim(emp_data,"Kvinner", "emp_women");

    trim(edu_data,"Menn","edu_01_man", "01");
    trim(edu_data,"Kvinner", "edu_01_women", "01");

    trim(edu_data,"Menn", "edu_02a_man", "02a");
    trim(edu_data,"Kvinner", "edu_02a_women", "02a");

    trim(edu_data,"Menn", "edu_03a_man", "03a");
    trim(edu_data,"Kvinner", "edu_03a_women", "03a");

    trim(edu_data,"Menn", "edu_04a_man", "04a");
    trim(edu_data,"Kvinner", "edu_04a_women", "04a");

    trim(edu_data,"Menn", "edu_09a_man", "09a");
    trim(edu_data,"Kvinner", "edu_09a_women", "09a");

    trim(edu_data,"Menn", "edu_11_man", "11");
    trim(edu_data,"Kvinner", "edu_11_women", "11");
}

/*Funksjon som klargjør data for å bli vist på HTML siden*/
function trim(data, gender, id, edu, extra_text) {
    if (edu === undefined){
        let trimmed = clean(JSON.stringify(data[gender])).split(",");
        placeHTML(id,trimmed, extra_text)
    } if (edu){
        let trimmed = clean(JSON.stringify(data[edu][gender])).split(",");
        placeHTML(id,trimmed,extra_text)
    }
}

/*Funksjon som renser et datasett. Ment for bruk sammen med trim()*/
function clean(text) {
    let cleaned = text.replace(/[^a-zA-Z0-9.,:\s*]/g, "");
    return cleaned.replace(/[:]/g,": ");
}

/*Funksjon som legger elementer/text til html-siden. En må spesifisere hvor en vil ha det (id) hva som skal vises (data) og (extra_text)*/
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

/*Funksjon som lar deg lage et enkelt element og plassere på html-siden. Id bestemmer hvor, data er hva du vil vise, type er hvilket element en skal lage*/
function placeTitle(id,data, type) {
    if (type === undefined){
        let placement = document.getElementById(id);
        let text = document.createTextNode(data);
        placement.appendChild(text)
    }
    if (type !== undefined){
        let placement = document.getElementById(id);
        let element = document.createElement(type);
        let text = document.createTextNode(data);
        element.appendChild(text);
        placement.appendChild(element)
    }
}

/*Samlefunksjon som klargjør all info som skal med i sammenligningen av to kommuner*/
function compare(pop,emp) {

    let id_list = ["mun_1_man","mun_2_man","mun_1_women","mun_2_women","mun_1_liste","mun_2_liste","mun_3_liste","mun_4_liste"];
    for (let i=0; i<id_list.length; i++){
        let placement = document.getElementById(id_list[i]);
        while (placement.firstChild){
            placement.removeChild(placement.firstChild)
        }
    }
    let mun_1 = regex_check(document.getElementById("comp_1").value);
    let mun_2 = regex_check(document.getElementById("comp_2").value);
    let emp_mun_1 = emp.getInfo(mun_1);
    let emp_mun_2 = emp.getInfo(mun_2);

    let mun_1_growth = com_data(emp_mun_1,"Menn");
    let mun_2_growth = com_data(emp_mun_2, "Menn");

    let resulatat_man = compare_growth(mun_1_growth,mun_2_growth);
    let resultat_total_man = sum_list(mun_1_growth, mun_2_growth);

    placeTitle("mun_1_man", emp_mun_1.name+" Menn");
    placeTitle("mun_2_man", emp_mun_2.name+" Menn");

    trim(emp_mun_1,"Menn", "mun_1_liste", undefined, resulatat_man[0]);
    trim(emp_mun_2,"Menn", "mun_2_liste", undefined, resulatat_man[1]);

    placeTitle("mun_1_liste", resultat_total_man[0][0]+" "+resultat_total_man[0][1].toFixed(1), "LI");
    placeTitle("mun_2_liste", resultat_total_man[1][0]+" "+resultat_total_man[1][1].toFixed(1), "LI");

    let mun_3_growth = com_data(emp_mun_1,"Kvinner");
    let mun_4_growth = com_data(emp_mun_2, "Kvinner");

    let resulatat_women = compare_growth(mun_3_growth,mun_4_growth);
    let resultat_total_women = sum_list(mun_3_growth, mun_4_growth);

    placeTitle("mun_1_women", emp_mun_1.name+" Kvinner");
    placeTitle("mun_2_women", emp_mun_2.name+" Kvinner");

    trim(emp_mun_1,"Kvinner", "mun_3_liste", undefined, resulatat_women[0]);
    trim(emp_mun_2,"Kvinner", "mun_4_liste", undefined, resulatat_women[1]);

    placeTitle("mun_3_liste", resultat_total_women[0][0]+" "+resultat_total_women[0][1].toFixed(1), "LI");
    placeTitle("mun_4_liste", resultat_total_women[1][0]+" "+resultat_total_women[1][1].toFixed(1), "LI");
}

/*Funksjon som regner ut vekst i prosentpoeng, returnerer en liste over vekst for hvert år (bortsett fra det første som er utgangspunktet)*/
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

/*Funksjon som summerer vekst i prosentpoeng fra to datasett, returnerer "vinner" og "taper" og tallet på den totale veksen*/
function sum_list(data,data2) {
    let x = 0;
    let y = 0;
    for (let i = 0; i < data.length; i++) {
        x += parseFloat(data[i]);
        y += parseFloat(data2[i]);
    }

    if ( x > y){
        let z = ["Total høyest vekst: ",x];
        let q = ["Total minst vekst: ",y];
        return[z,q]
    }

    if ( x < y){
        let z = ["Total høyest vekst: ",y];
        let q = ["Total minst vekst: ",x];
        return[z,q]
    }

}

/*Funksjon som sammenligner vekst i prosentpoeng år for år mellom to datasett. Returnerer "vinner" og taper" for hver år*/
function compare_growth(data,data2) {
    let array = [];
    let array2 = [];
    for (let i = 0; i <data.length ; i++) {
        if (data[i] > data2[i]){
            array.push("Høyest vekst: " + data[i].toFixed(1));
            array2.push("Minst vekst: " + data2[i].toFixed(1))
        }
        if (data[i] < data2[i]){
            array2.push("Høyest vekst: " + data2[i].toFixed(1));
            array.push("Minst vekst: " + data[i].toFixed(1))
        }
        if (data[i] === data2[i] && i !== 0){
            array2.push("Lik vekst: " + data2[i].toFixed(1));
            array.push("Lik vekst: " + data[i].toFixed(1))
        }

        if (i === 0){
            array.push("Utgangspunkt");
            array2.push("Utgangspunkt");
        }
    }
    return [array,array2]
}

/*Funksjon som gjør klar programmet. Her laged det tre objekter av typen Search, de får urlene til sitt passende datasett.
* Alle knapper på siden blir disabled mens datasettene lastes. Det er også test på skjermen som sier "laster".
* Datasettene blir lastet inn en etter en og når siste(education) er ferdig så enables knappene igjen og loading-skjerm forsvinner */
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
        details(population,employed,education); document.getElementById("historical").style.display="flex";
    });

    document.getElementById("compare_button").addEventListener("click", function () {
        compare(population,employed)
    });
}

