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
  const listItemsDynamic = thisWeeksGameData.map((gameobject) =>
        <li key={gameobject.gameID.toString()}>
          <GameTable homeTeamName = {gameobject.homeTeamName}
                    awayTeamName = {gameobject.awayTeamName}
                    time = {(new Date(gameobject.date)).
                      toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    props = {gameobject.gameID.toString()} />
        </li>
    );
    ReactDOM.render(<ul class="gameul">{listItemsDynamic}</ul>, document.querySelector("#gamearea"));
}

var thisWeeksGameData = [];
var selectedWeek = getCurrentWeek();

function setThisWeeksGameData(week) {
  thisWeeksGameData = [];
  console.log("Checking for week: " + week + ", pushing!");
  for (var i = 0; i < gamedata.length; i++) {
    if (getWeekNumber(new Date(gamedata[i].date)) === week) {
      thisWeeksGameData.push(gamedata[i]);
      console.log("Pushed obj below: ");
      console.log(gamedata[i]);
    }
  }
  console.log(thisWeeksGameData);
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
const buttonNext = <button onClick={nextButtonClicked}> Nästa vecka </button>
const buttonPrev = <button onClick={prevButtonClicked}> Föregående vecka </button>

ReactDOM.render(buttonNext, document.querySelector("#buttonNext"));
ReactDOM.render(buttonPrev, document.querySelector("#buttonPrev"));
//ReactDOM.render(element, document.querySelector('#gamearea'));
//ReactDOM.render(gameElement, document.querySelector("#gamearea"));
//ReactDOM.render(<ul class="gamelistobject">{listItems}</ul>, document.querySelector("#gamearea"));
console.log(gamedata);
console.log(getCurrentWeek());
