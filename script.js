var http = require('http');
var fs = require('fs');
var cheerio = require("cheerio");
var request = require("request");
var cheerioTableparser = require("cheerio-tableparser");

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile("./index.html", null, function(error, data) {
    	if (error) {
    		res.writeHead(404);
    		res.write("File not found");
    	} else {
    		res.write(data);
    	}
    	res.end();
    });
}).listen(8080);

function hello(matches) {
	
	var i;
	for (i = 0; i < matches; i++) {
		var newElem = document.getElementById("mall").cloneNode(true);
		document.getElementById("mall").style.visibility = "hidden";
		newElem.id = "mall" + i;
		var list = document.getElementById("lista");
		list.insertBefore(newElem, document.getElementById("mall"));
		newElem.style.visibility = "";

	}
}

var url = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7931&k=LS7931&p=1";
request(url, function(err, resp, html) {
	if (!err && resp.statusCode == 200) {
		var $ = cheerio.load(html);
		var table = $("#tabell_std");

		cheerioTableparser($);
		var data = $("#tabell_std").parsetable(true,true,true);
		console.log(data);

		for (var i = 0; i < data[0].length; i++) {
			console.log(data[0][i]);
		}

	}
})

