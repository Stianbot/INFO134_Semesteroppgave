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
    this.getNames = getNames;
    this.getIDs = getIDs;
    this.load = load;
    this.onload = null;
}

