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

var thisWeeksGameData = [];
const selectedWeek = getCurrentWeek();

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
  console.log("next");
}

function prevButtonClicked() {
  console.log("prev");
}

function Welcome(props) {
  return <h1>Hello, {props.name} {props.name2}</h1>
}

function GameTable(props) {
  if (49 === getWeekNumber(new Date(props.date))) {
    console.log(props.date);
    console.log("Date matched");
    return null;
  } else {
    return (
      <table>
        <tbody>
          <tr>
            <td>{props.homeTeamName}</td>
            <td>-</td>
            <td>{props.awayTeamName}</td>
          </tr>
        </tbody>
      </table>
    );
  }
}
const element = <Welcome name="Olle" name2="Abbe" />;
const gameElement = <GameTable homeTeamName = "ksk" awayTeamName = "ifk" />;
setThisWeeksGameData(2);
const listItems = thisWeeksGameData.map((gameobject) =>
      <li key={gameobject.gameID.toString()}>
        <GameTable homeTeamName = {gameobject.homeTeamName}
                  awayTeamName = {gameobject.awayTeamName}
                  date = {gameobject.date}
                  props = {gameobject.gameID.toString()}  />
      </li>
      );

const buttonNext = <button onclick={nextButtonClicked}> Nästa vecka </button>
const buttonPrev = <button onclick={prevButtonClicked}> Föregående vecka </button>

ReactDOM.render(buttonNext, document.querySelector("#buttonNext"));
ReactDOM.render(buttonPrev, document.querySelector("#buttonPrev"));
ReactDOM.render(element, document.querySelector('#gamearea'));
ReactDOM.render(gameElement, document.querySelector("#gamearea"));
ReactDOM.render(<ul>{listItems}</ul>, document.querySelector("#gamearea"));
console.log(gamedata);
console.log(getCurrentWeek());
