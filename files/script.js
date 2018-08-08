function hello() {
	
	var newElem = document.getElementById("mall").cloneNode(true);
	document.getElementById("mall").style.visibility = "hidden";
	var list = document.getElementById("lista");
	list.insertBefore(newElem, document.getElementById("mall"));
}
hello();

function scrape() {
	define(['require', 'cheerio'], function (require) {
    	var namedModule = require('cheerio');
	});
}

