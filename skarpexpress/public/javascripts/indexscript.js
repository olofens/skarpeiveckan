function getCurrentWeek() {
    var nowDate = new Date();
    return getWeekNumber(nowDate);
}

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return week number
    return weekNo;
}

function prevClick() {

    selectedWeek--;
    showWeekGames(selectedWeek);
}

function nextClick() {
    selectedWeek++;
    showWeekGames(selectedWeek);
}

function showWeekGames(week) {
    updateWeek(week);
    var ul = document.getElementById("gamelist");
    ul.innerHTML = "";
    var data = gamedata;
    console.log(data);


    var thisWeekGamesArray = [];
    data.forEach( function(doc, err) {
       if (err) console.log(err.message);
       if (getWeekNumber(new Date(doc.date)) === week) {
           thisWeekGamesArray.push(doc);
       }
    });

    thisWeekGamesArray.forEach( function (doc, err) {
        if(err) console.log(err.message);
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(doc.homeTeamName + " - " + doc.awayTeamName));
        ul.appendChild(li);
    });

}

var weekStringElement;
function doFirstWeek() {
    updateWeek(12);
}

function updateWeek(week) {
    weekStringElement = document.getElementById("weeknr");
    weekStringElement.innerHTML = "Vecka " + week;
    console.log("ran do week");
}

var selectedWeek = getCurrentWeek();
