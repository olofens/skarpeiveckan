const dayArrayString = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

function updateDates() {
  for (var i = 0; i < gamedata.length; i++) {
    gamedata[i].date = new Date(gamedata[i].date);
  }
  gamedata.sort(function(a,b) {
    if (a.date < b.date) return -1;
    else if (a.date > b.date) return 1;
    else return 0;
  });
  console.log("Sorting done!");
  console.log(gamedata);
}
updateDates();

function objectifyWeekGames(weekGames) {
  var listOfGames = [];
  console.log("objectification started...");
  for (var i = 0; i < weekGames.length; i++) {
    console.log("Going into check");
    if (listOfGames[weekGames[i].date.getDay()] === undefined) {
      console.log("listOfGames[" + i + "] is null, adding: " + [weekGames[i]]);
      listOfGames[weekGames[i].date.getDay()] = [weekGames[i]];
    } else {
      console.log("listOfGames[" + i + "] is not null, pushing: " + [weekGames[i]]);
      listOfGames[weekGames[i].date.getDay()].push(weekGames[i]);
    }
  }

  console.log("Putting [0] -> [6]");
  console.log("Before: " + listOfGames);
  var temp = listOfGames[0];
  for (var i = 0; i < listOfGames.length; i++) {
    listOfGames[i] = listOfGames[i+1];
  }
  listOfGames[6] = temp;
  console.log("After: " + listOfGames);
  return listOfGames;
}

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

function changeShowedGames(newWeek) {
  setThisWeeksGameData(newWeek);

  clearAllGames();

  var listOfGames = objectifyWeekGames(thisWeeksGameData);
  for (var i = 0; i < listOfGames.length; i++) {
    if (listOfGames[i] !== undefined) {
      console.log(dayArrayString[i] + " games are: ");
      for (var j = 0; j < listOfGames[i].length; j++) {
        console.log(listOfGames[i][j]);
      }
    }
  }

  for (var i = 0; i < listOfGames.length; i++) {
    document.getElementById(dayArrayString[i].toString() + "Top").style.display = "";
    if (listOfGames[i] !== undefined) {

      var listItemsDynamic = [];
      listItemsDynamic = listOfGames[i].map((gameobject) =>
        <li key={gameobject.gameID.toString()}>
          <GameTable homeTeamName = {gameobject.homeTeamName}
                    awayTeamName = {gameobject.awayTeamName}
                    time = {gameobject.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    props = {gameobject.gameID.toString()} />
        </li>
    );
    ReactDOM.render(<ul class="gameul">{listItemsDynamic}</ul>, document.querySelector("#" + dayArrayString[i].toString() + "Games"));
    } else {
      document.getElementById(dayArrayString[i].toString() + "Top").style.display = "none";
    }
  }
  ReactDOM.render(<p>v{newWeek}</p>, document.querySelector("#weekText"));
}

var thisWeeksGameData = [];
var selectedWeek = getCurrentWeek();

function setThisWeeksGameData(week) {
  thisWeeksGameData = [];
  console.log("Checking for week: " + week + ", pushing!");
  for (var i = 0; i < gamedata.length; i++) {
    if (getWeekNumber(gamedata[i].date) === week) {
      thisWeeksGameData.push(gamedata[i]);
      console.log("Pushed obj below: ");
      console.log(gamedata[i]);
    }
  }
  console.log(thisWeeksGameData);
  console.log(objectifyWeekGames(thisWeeksGameData));
}

function nextButtonClicked() {
  selectedWeek++;
  changeShowedGames(selectedWeek);
}

function prevButtonClicked() {
  selectedWeek--;
  changeShowedGames(selectedWeek);
}

function Welcome(props) {
  return <h1>Hello, {props.name} {props.name2}</h1>
}

function clearAllGames() {
  for (var i = 0; i < dayArrayString.length; i++) {
    ReactDOM.render(<p> </p>, document.querySelector("#" + dayArrayString[i].toString() + "Games"));
  }
}

function GameTable(props) {
    return (
      <table class="game">
        <tbody>
          <tr>
            <td><img src="https://imgur.com/S1wlTMy.jpg" height="50" width="50"></img></td>
            <td>{props.time}</td>
            <td><img src="https://imgur.com/S1wlTMy.jpg" height="50" width="50"></img></td>
          </tr>
          <tr>
            <td class="teamname">{props.homeTeamName}</td>
            <td class="centerdash">-</td>
            <td class="teamname">{props.awayTeamName}</td>
          </tr>
        </tbody>
      </table>
    );
}

changeShowedGames(getCurrentWeek());
const buttonNext = <button onClick={nextButtonClicked}> Nästa </button>
const buttonPrev = <button onClick={prevButtonClicked}> Förra </button>

ReactDOM.render(buttonNext, document.querySelector("#buttonNext"));
ReactDOM.render(buttonPrev, document.querySelector("#buttonPrev"));

console.log(gamedata);
console.log(getCurrentWeek());
console.log(objectifyWeekGames(thisWeeksGameData));