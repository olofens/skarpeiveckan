var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cheerio = require("cheerio");
var request = require("request");
var cheerioTableparser = require("cheerio-tableparser");
var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var mongourl = "mongodb://localhost:27017/";
var url = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7931&k=LS7931&p=1";
function doRequestGetGamePlace(url) {
    request(url, function(err, resp, html) {
        if (!err && resp.statusCode === 200) {
            var $ = cheerio.load(html);

            $(".row tr").each(function(i,elem) {
                if ($(this).text().includes("Spelplats")) {
                    var string = $(this).text();
                    var gamePlace = string.replace("Spelplats", "");
                }
            });
        }
    });
}

function doRequestGetLinks() {
    var url2 = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7916&k=LS7916&p=1";
    request(url2, function(err, resp, html) {
        if (!err && resp.statusCode === 200) {
            var $ = cheerio.load(html);

            console.log("RANNNNN");

            var divisionNumbers = [];
            var links = [];

            $(".dropdown-menu li").each(function(i,elem) {
                var linkHtml = $(this).html();
                linkHtml = linkHtml.substring(linkHtml.indexOf('"') + 1, linkHtml.lastIndexOf('"'));
                if (linkHtml.includes("SBF_SERIE_AVD")) {
                     divisionNumbers.push(linkHtml.slice(32, linkHtml.indexOf("&")));
                }
            });
            console.log(divisionNumbers.toString());

            for (var i = 0; i < divisionNumbers.length; i++) {
                links.push("https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD"
                    + divisionNumbers[i] + "&k=LS"
                    + divisionNumbers[i].substring(0,4) + "&p=1")
            }

            console.log(links.toString());

        }
    });
}

function doRequestUpdateGames() {
    request(url, function(err, resp, html) {
        if (!err && resp.statusCode === 200) {
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


            var divisionName;
            $(".row h3").each(function(i,elem) {
                divisionName = $(this).text();
            });

            var oddRows = [];
            var evenRows = [];
            var gameRows = [];

            $(".odd").each(function (i, elem) {
                var matchID = $(this).attr("onclick");
                console.log(matchID);
                matchID = matchID.slice(matchID.length-9, matchID.length-1);
                console.log(matchID);
                oddRows.push([$(this).text(), matchID, "place"]);
            });

            $(".even").each(function (i, elem) {
                var matchID = $(this).attr("onclick");
                console.log(matchID);
                matchID = matchID.slice(matchID.length-9, matchID.length-1);
                console.log(matchID);
                evenRows.push([$(this).text(), matchID, "place"]);
            });

            oddRows.join(", ");
            //console.log("ODD " + oddRows.length);
            //console.log(oddRows);

            evenRows.join(", ");
            //console.log("EVEN " + evenRows.length);
            //console.log(evenRows);

            for (var i = 0; i < oddRows.length; i++) {
                gameRows[i] = oddRows[i];
            }

            for (var i = oddRows.length; i < oddRows.length + evenRows.length; i++) {
                gameRows[i] = evenRows[i-oddRows.length];
            }

            //console.log("LENGTH: " + gameRows.length);

            /*console.log("UNSORTED");
            for (var i = 0; i < gameRows.length; i++) {
                console.log(i + ": " + gameRows[i]);
            }*/

            var gameObjects = [];
            for (var i = 0; i < gameRows.length; i++) {
                //gameObjects.push([parseRow(gameRows[i][0]), gameRows[i][1], gameRows[i][2]]);
                gameObjects.push(objectify((gameRows[i][0]), gameRows[i][1], gameRows[i][2]));
            }




            gameObjects.sort(function(a,b) {
                if (a.date < b.date) return -1;
                else if (a.date > b.date) return 1;
                else return 0;
            });


            console.log("SORTED");
            for (var i = 0; i < gameObjects.length; i++) {
                console.log(i + ": " + gameObjects[i].date);
            }

            MongoClient.connect(mongourl, function(err, db) {
                if (err) throw err;
                var dbo = db.db("mydb");

                dbo.collection("väst-div2-games").deleteMany({});

                for (var i = 0; i < gameObjects.length; i++) {
                    dbo.collection(divisionName).updateOne(
                        {"gameID":gameObjects[i].gameID},
                        { $set: {
                                "homeTeamName":   gameObjects[i].homeTeamName,
                                "awayTeamName":   gameObjects[i].awayTeamName,
                                "homeTeamScore":  gameObjects[i].homeTeamScore,
                                "awayTeamScore":  gameObjects[i].awayTeamScore,
                                "gameID":         gameObjects[i].gameID,
                                "gameLocation":   gameObjects[i].gameLocation
                            }
                        },
                        {upsert: true}
                    );
                    console.log(i + " - updated this: " + gameObjects[i]);
                }

                db.close();
            });
        }
    });
}


function objectify(row, gameID, gameLocation) {
    var string = row;
    string = string.replace("\n", "");
    string = string.replace("\n", "");
    string = string.replace("\n", "");

    var colonIndex = string.indexOf(":");

    var stringTimeHour = string.slice(colonIndex-2, colonIndex).trim();
    var stringTimeMin = string.slice(colonIndex+1, colonIndex+3).trim();

    var nameDashIndex = string.indexOf("-");
    var scoreDashIndex = string.lastIndexOf("-");

    var stringHomeTeam = string.slice(colonIndex+4, nameDashIndex-1).trim();

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
    var stringHomeScore = string.slice(indexBeforeScore, scoreDashIndex).trim();
    var stringAwayScore = string.slice(scoreDashIndex+1, indexAfterScore).trim();
    var stringDay = string.slice(4,6).trim();
    var stringMonth = string.slice(7,9).trim();

    var gameYear;
    var dateNow = new Date();

    // if date is after june, its last year
    // else date is before june, its this year
    // this needs a better system. when the season starts games after june are this year
    // until after december... need to figure something out here
    if (Number(stringMonth) > 6) {
        gameYear = dateNow.getFullYear()-1;
    } else {
        gameYear = dateNow.getFullYear();
    }

    var date = new Date(gameYear, Number(stringMonth)-1, Number(stringDay),
        Number(stringTimeHour), Number(stringTimeMin));

    console.log(date.toDateString());

    return {
        date: date,
        homeTeamName:stringHomeTeam,
        awayTeamName:stringAwayTeam,
        homeTeamScore:stringHomeScore,
        awayTeamScore:stringAwayScore,
        gameID: gameID,
        gameLocation: gameLocation
    };
}

setInterval(function() {
    var date = new Date();
    if ( date.getSeconds() % 10 === 0) {
        doRequestGetLinks();
        //doRequestUpdateGames();
    }
}, 1000);

