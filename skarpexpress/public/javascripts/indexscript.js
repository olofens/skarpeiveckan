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

function clickfunc() {
    var ul = document.getElementById("gamelist");
    ul.innerHTML = "";
    var data = gamedata;
    console.log(data);

    for (var i = 0; i < 3; i++) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode("Hello"));
        ul.appendChild(li);
    }
}

var selectedWeek = getWeekNumber(new Date());
