function hello() {
	
	var newElem = document.getElementById("mall").cloneNode(true);
	document.getElementById("mall").style.visibility = "hidden";
	var list = document.getElementById("lista");
	list.insertBefore(newElem, document.getElementById("mall"));
}
hello();

function scrape() {
	const cheerio = require("cheerio");
	const $ = cheerio.load("https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7931&k=LS7931&p=1");
	console.log($);
}

