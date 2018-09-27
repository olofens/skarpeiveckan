
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

function Welcome(props) {
  return <h1>Hello, {props.name} {props.name2}</h1>
}

function GameTable(props) {
  console.log("comparing 49 to " + getWeekNumber(new Date(props.date)));
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

const listItems = gamedata.map((gameobject) =>
    <li key={gameobject.gameID.toString()}>
      <GameTable homeTeamName = {gameobject.homeTeamName}
                awayTeamName = {gameobject.awayTeamName}
                date = {gameobject.date}  />
    </li>);

ReactDOM.render(element, document.querySelector('#gamearea'));
ReactDOM.render(gameElement, document.querySelector("#gamearea"));
ReactDOM.render(<ul>{listItems}</ul>, document.querySelector("#gamearea"));
console.log(gamedata);
console.log(getCurrentWeek());
