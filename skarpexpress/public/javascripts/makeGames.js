
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>
}

const element = <Welcome name="Olle" />;

ReactDOM.render(element, document.querySelector('#hello_world_wrapper'));
console.log(gamedata);
