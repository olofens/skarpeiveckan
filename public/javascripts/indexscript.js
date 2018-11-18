

const buttonNext = <button id="skarpe" onClick={function() {
    location.href = "localhost:3000/skarpenord";
}}>Skarpe Nord</button>;

ReactDOM.render(buttonNext, document.querySelector("#buttonArena"));
