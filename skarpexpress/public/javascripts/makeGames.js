
function Welcome(props) {
  return <h1>Hello, {props.name} {props.name2}</h1>
}

function GameTable(props) {
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
const element = <Welcome name="Olle" name2="Abbe" />;
const gameElement = <GameTable homeTeamName = "ksk" awayTeamName = "ifk" />;

const listItems = gamedata.map((gameobject) => <GameTable homeTeamName = {gameobject.homeTeamName}
              awayTeamName = {gameobject.awayTeamName} />);




ReactDOM.render(element, document.querySelector('#gamearea'));
ReactDOM.render(gameElement, document.querySelector("#gamearea"));
ReactDOM.render(<ul>{listItems}</ul>, document.querySelector("#gamearea"));
console.log(gamedata);
