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
        if (doTable) {
            cheerioTableparser($);
            var data = $("#tabell_std").parsetable(true, true, true);
            console.log(data);

            for (var i = 0; i < data[0].length; i++) {
                console.log(data[0][i]);
            }
        }

        var oddRows = [];
        var evenRows = [];
        var gameRows = [];

        $(".odd").each(function (i, elem) {
            oddRows[i] = $(this).text();
        });

        $(".even").each(function (i, elem) {
            evenRows[i] = $(this).text();
        });

        oddRows.join(", ");
        console.log("ODD " + oddRows.length);
        console.log(oddRows);

        evenRows.join(", ");
        console.log("EVEN " + evenRows.length);
        console.log(evenRows);

        for (var i = 0; i < oddRows.length; i++) {
            gameRows[2 * i - 1] = oddRows[i];
            gameRows[2 * i] = evenRows[i];
        }

        for (var i = 0; i < gameRows.length; i++) {
            console.log(gameRows[i]);
        }

        var gameObject = parseRow(gameRows[0]);
        console.log(gameObject.awayTeamName);

    }
});



function parseRow(row) {
	console.log(row);
    var string = row;
    console.log("string: " + string);
    string = string.replace("\n", "");
    console.log("string: " + string);
    string = string.replace("\n", "");
    console.log("string: " + string);
    string = string.replace("\n", "");
    console.log("string:'" + string + "'");

    var colonIndex = string.indexOf(":");
    //console.log(colonIndex);

    //var stringTime = string.slice(10 ,colonIndex-2);
    //console.log("Time: " + stringTime);

    var stringTimeHour = string.slice(colonIndex-2, colonIndex).trim();
    console.log("Time hour: " + stringTimeHour);

    var stringTimeMin = string.slice(colonIndex+1, colonIndex+3).trim();
    console.log("Time min: " + stringTimeMin);

    var nameDashIndex = string.indexOf("-");
    var scoreDashIndex = string.lastIndexOf("-");

    var stringHomeTeam = string.slice(colonIndex+4, nameDashIndex-1).trim();
    console.log("Home team: " + stringHomeTeam);

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

    var stringAwayTeam = string.slice(nameDashIndex+1, indexBeforeScore).trim();
    console.log("Away team: " + stringAwayTeam);

    var stringHomeScore = string.slice(indexBeforeScore, scoreDashIndex).trim();
    console.log("Home score: " + stringHomeScore);

    var stringAwayScore = string.slice(scoreDashIndex+1, indexAfterScore).trim();
    console.log("Away score: " + stringAwayScore);

    var stringWeekday = string.slice(0,3).trim();
    console.log("Weekday: " + stringWeekday);

    var stringDay = string.slice(4,6).trim();
    console.log("Day: " + stringDay);

    var stringMonth = string.slice(7,9).trim();
    console.log("Month: " + stringMonth);

    return {
    	weekday:stringWeekday,
		day:stringDay,
		month:stringMonth,
		hour:stringTimeHour,
		minute:stringTimeMin,
		homeTeamName:stringHomeTeam,
		awayTeamName:stringAwayTeam,
		homeTeamScore:stringHomeScore,
		awayTeamScore:stringAwayScore
	};
}