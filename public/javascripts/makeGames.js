const dayArrayString = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
const teamLogoList = [
  // link to imgur album: https://imgur.com/a/dMITeRW
  {name: "Kungälvs SK", imglink: "https://imgur.com/8oP89Cn.jpg"},
  {name: "IFK Kungälv", imglink: "https://imgur.com/8mdIpWo.jpg"},
  {name: "Kareby IS", imglink: "https://imgur.com/R5QLfXs.jpg"},
  {name: "Kareby Kungälv", imglink: "https://imgur.com/R5QLfXs.jpg"},
  {name: "Kareby IS P11", imglink: "https://imgur.com/R5QLfXs.jpg"},
  {name: "Surte/Kareby", imglink: "https://imgur.com/fFbH42j.jpg"},
  {name: "KS Bandy", imglink: "https://imgur.com/fFbH42j.jpg"},
  {name: "Surte BK", imglink: "https://imgur.com/0mAzt9i.jpg"},
  {name: "Vildkatterna", imglink: "https://imgur.com/0mAzt9i.jpg"},
  {name: "Lidköpings AIK", imglink: "https://imgur.com/nuNuxcX.jpg"},
  {name: "LAIK", imglink: "https://imgur.com/nuNuxcX.jpg"},
  {name: "LAIK U", imglink: "https://imgur.com/nuNuxcX.jpg"},
  {name: "Oskarströms BK", imglink: "https://imgur.com/cVemerO.jpg"},
  {name: "Otterbäckens BK", imglink: "https://imgur.com/5SHsDgp.jpg"},
  {name: "Otterbäcken/Hajstorp", imglink: "https://imgur.com/5SHsDgp.jpg"},
  {name: "BK Slottshov", imglink: "https://imgur.com/mZGLcQq.jpg"},
  {name: "Sunvära SK", imglink: "https://imgur.com/TX5pxdR.jpg"},
  {name: "Västanfors IF", imglink: "https://imgur.com/fWRNBaZ.jpg"},
  {name: "Frillesås/Sunvära", imglink: "https://imgur.com/gzbgQTc.jpg"},
  {name: "Ljusdals BK", imglink: "https://imgur.com/PYiV02f.jpg"},
  {name: "Villa Lidköping BK (blå)", imglink: "https://imgur.com/DY5fg8R.jpg"},
  {name: "Villa Lidköping BK (vit)", imglink: "https://imgur.com/DY5fg8R.jpg"},
  {name: "Villa Lidköping BK", imglink: "https://imgur.com/DY5fg8R.jpg"},
  {name: "Villa Flick", imglink: "https://imgur.com/DY5fg8R.jpg"},
  {name: "Villa LBK (blå)", imglink: "https://imgur.com/DY5fg8R.jpg"},
  {name: "Vadsjön BK", imglink: "https://imgur.com/xvAB2Oi.jpg"},
  {name: "Tranås BoIS", imglink: "https://imgur.com/6RnK67G.jpg"},
  {name: "Tranås Bois", imglink: "https://imgur.com/6RnK67G.jpg"},
  {name: "Viking/LIF/FIF", imglink: "https://imgur.com/AoO7oFc.jpg"},
  {name: "Vargöns BK", imglink: "https://imgur.com/x0ktKAw.jpg"},
  {name: "IF Boltic", imglink: "https://imgur.com/BtZXr0P.jpg"},
  {name: "Torup", imglink: "https://imgur.com/JyVBhkZ.jpg"},
  {name: "Gripen Trollhättan BK", imglink:"https://imgur.com/cK7zWzn.jpg"},
  {name: "Mölndal Bandy", imglink: "https://imgur.com/Q2Ar2VS.jpg"}, 
  {name: "SK Höjden", imglink: "https://imgur.com/TVvNZR3.jpg"},
  {name: "SK Höjden Flickor", imglink: "https://imgur.com/TVvNZR3.jpg"},
  {name: "BK Rosa", imglink: "https://imgur.com/lhAXK8A.jpg"},
  {name: "Blåsuts BK", imglink: "https://imgur.com/O7xp7uG.jpg"},
  {name: "Blåsut BK", imglink: "https://imgur.com/O7xp7uG.jpg"},
  {name: "Vänersborg/Blåsut", imglink: "https://imgur.com/O7xp7uG.jpg"},
  {name: "Nässjö/Målilla", imglink: "https://imgur.com/2A4e2nt.jpg"},
  {name: "Karlstad Bandy", imglink: "https://imgur.com/L2w1QcX.jpg"},
  {name: "Peace & Love City Bandy", imglink: "https://imgur.com/Uh2ix2U.jpg"},
  {name: "IFK Vänersborg", imglink: "https://imgur.com/Fm3uhse.jpg"},
  {name: "IFK Rättvik", imglink: "https://imgur.com/vGlpNor.jpg"},
  {name: "Borås Bandy", imglink: "https://imgur.com/FAyGEk7.jpg"},
  {name: "Nässjö IF", imglink: "https://imgur.com/b3feOtO.jpg"},
  {name: "Höjden/Mölndal", imglink: "https://imgur.com/5syOt3b.jpg"},
  {name: "Mölndal/Höjden", imglink: "https://imgur.com/5syOt3b.jpg"},
  {name: "ÅbyTjureda IF", imglink: "https://imgur.com/hlLLTWH.jpg"},
  {name: "Örebro SK", imglink: "https://imgur.com/4SRN1wN.jpg"},
  {name: "Vetlanda BK", imglink: "https://imgur.com/8jkgTzI.jpg"},
  // second imgur album: https://imgur.com/a/WGQztFK
  {name: "Västerstrands AIK", imglink: "https://imgur.com/foMDGlW.jpg"},
  {name: "Västerås SK", imglink: "https://imgur.com/zMRI4oV.jpg"},
  {name: "Västerås SK U", imglink: "https://imgur.com/zMRI4oV.jpg"}];

function updateDates() {
  for (var i = 0; i < gamedata.length; i++) {
    gamedata[i].date = new Date(gamedata[i].date);
    if (gamedata[i].date.getUTCMinutes() < 10) {
      gamedata[i].stringTime = gamedata[i].date.getUTCHours() + ":0" + gamedata[i].date.getUTCMinutes(); 
    } else {
      gamedata[i].stringTime = gamedata[i].date.getUTCHours() + ":" + gamedata[i].date.getUTCMinutes();
    }
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

function getImgLink(teamName) {
  for (var i = 0; i < teamLogoList.length; i++) {
    if (teamName === teamLogoList[i].name) {
      return teamLogoList[i].imglink;
    }
  }
}

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
                    series = {gameobject.series}
                    time = {"Matchstart " + gameobject.stringTime}
                    homeimg = {getImgLink(gameobject.homeTeamName)}
                    awayimg = {getImgLink(gameobject.awayTeamName)}
                    props = {gameobject.gameID.toString()} />
        </li>
    );
    ReactDOM.render(<ul class="gameul">{listItemsDynamic}</ul>, document.querySelector("#" + dayArrayString[i].toString() + "Games"));
    
    // set Header texts (ex Lördag, 24/11)

    ReactDOM.render(<p class="gameday">{dayArrayString[i].toString() + ", " + listOfGames[i][0].date.getUTCDate() + "/" + (listOfGames[i][0].date.getUTCMonth()+1)}</p>,
     document.querySelector("#" + dayArrayString[i].toString() + "Text"));
    } else {
      document.getElementById(dayArrayString[i].toString() + "Top").style.display = "none";
    }
  }
  ReactDOM.render(<p>Vecka {newWeek}</p>, document.querySelector("#weekText"));
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
  if (selectedWeek === 53) {
    selectedWeek = 1;
  }
  changeShowedGames(selectedWeek);
}

function prevButtonClicked() {
  selectedWeek--;
  if (selectedWeek === 0) {
    selectedWeek = 52;
  }
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
            <td width="25%" className="series">{props.series}</td>
            <td width="25%"><img src={props.homeimg} height="50"></img></td>
            <td width="25%">{props.time}</td>
            <td width="25%"><img src={props.awayimg} height="50"></img></td>
          </tr>
          <tr>
            <td width="25%"></td>
            <td width="25%" className="teamname">{props.homeTeamName}</td>
            <td width="25%" className="centerdash">-</td>
            <td width="25%" className="teamname">{props.awayTeamName}</td>
          </tr>
        </tbody>
      </table>
    );
}

changeShowedGames(getCurrentWeek());
const buttonNext = <button className="prevnextbutton" onClick={nextButtonClicked}><i class="arrow right"></i></button>
const buttonPrev = <button className="prevnextbutton" onClick={prevButtonClicked}><i class="arrow left"></i></button>


ReactDOM.render(buttonNext, document.querySelector("#buttonNext"));
ReactDOM.render(buttonPrev, document.querySelector("#buttonPrev"));

console.log(gamedata);
console.log(getCurrentWeek());
console.log(objectifyWeekGames(thisWeeksGameData));