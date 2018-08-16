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
		//var table = $("#tabell_std");

		var doTable = false;
		if(doTable) {
            cheerioTableparser($);
            var data = $("#tabell_std").parsetable(true,true,true);
            console.log(data);

            for (var i = 0; i < data[0].length; i++) {
                console.log(data[0][i]);
            }
		}

		var oddRows = [];
        var evenRows = [];

		$(".odd").each(function(i, elem) {
			oddRows[i] = $(this).text();
		});

        $(".even").each(function(i, elem) {
            evenRows[i] = $(this).text();
        });

		oddRows.join(", ");
		console.log("ODD " + oddRows.length);
		console.log(oddRows);

        evenRows.join(", ");
        console.log("EVEN " + evenRows.length);
        console.log(evenRows);

        var allRows = [];

        for (var i = 0; i < oddRows.length; i++) {
        	allRows[2*i-1] = oddRows[i];
        	allRows[2*i] = evenRows[i];
		}

		for (var i = 0; i < allRows.length; i++) {
			console.log(allRows[i]);
		}

		string = allRows[0];
		console.log("string: " + string);
		string = string.replace("\n", "");
        console.log("string: " + string);
        string = string.replace("\n", "");
        console.log("string: " + string);
        string = string.replace("\n", "");
        console.log("string: " + string);

        var colonIndex = string.indexOf(":");
        //console.log(colonIndex);

        var string2 = string.slice(0,colonIndex-2);
        console.log(string2);

        var string3 = string.slice(colonIndex-2, colonIndex+3);
        console.log(string3);

        var nameDashIndex = string.indexOf("-");
        var scoreDashIndex = string.lastIndexOf("-");

        var string4 = string.slice(colonIndex+4, nameDashIndex-1);
        console.log(string4);

        /*console.log(string[scoreDashIndex]);
        console.log(string[scoreDashIndex-1]);
        console.log("-2: " + string[scoreDashIndex-2]);
        console.log("-3: " + string[scoreDashIndex-3]);

        console.log();

        console.log(string[scoreDashIndex]);
        console.log(string[scoreDashIndex+1]);
        console.log("+2: " + string[scoreDashIndex+2]);
        console.log("+3: " + string[scoreDashIndex+3]);*/

        var indexBeforeScore;
        var indexAfterScore;

        if (string[scoreDashIndex-3] === "") {
        	indexBeforeScore = scoreDashIndex - 3;
		} else {
        	indexBeforeScore = scoreDashIndex - 4;
		}

		if (string[scoreDashIndex + 3] === "") {
			indexAfterScore = scoreDashIndex + 3;
		} else {
			indexAfterScore = scoreDashIndex + 4;
		}

		var string5 = string.slice(nameDashIndex+1, indexBeforeScore);
		console.log(string5);

		var string6 = string.slice(indexBeforeScore, scoreDashIndex);
		console.log(string6);

		var string7 = string.slice(scoreDashIndex+1, indexAfterScore);
		console.log(string7);

		



















	}
})

