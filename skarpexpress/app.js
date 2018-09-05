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
function doRequestGetGamePlace(url, mycallback) {
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

/*function updateAllSeriesGameLocations() {
    MongoClient.connect(mongourl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");

        dbo.collection("links").find({}).toArray(function(err, res) {
            db.close();

            for (var i = 0; i < res.length; i++) {
                request(res[i].link, function(err, resp, html) {
                    if (!err && resp.statusCode === 200) {
                        var $ = cheerio.load(html);

                        $(".row h3").each(function(i,elem) {
                            console.log("ran");
                            updateSeriesGameLocations($(this).text());
                        console.log("ran outside");
                    }
                });
            }
        });
    });
}*/

function updateSeriesGameLocations(series) {
    MongoClient.connect(mongourl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");

        dbo.collection(series).find({}).toArray(function(err, res) {
            if (err) throw err;
            var foundString;
            var gamePlace;
            var dbUpdates = 0;
            var times = 0;
            for (var i = 90; i < res.length; i++) {
                times++;
                request(res[i].gameLink, function(err, resp, html) {
                    console.log(times);
                    console.log("TIMES: " + times);
                    if (err) {
                        console.log(err.message);
                        throw err;
                    }
                    if (!err && resp.statusCode === 200) {
                        //console.log("inhere");
                        var $ = cheerio.load(html);

                        var onclickArray = [];

                        $(".row tr").each(function(i2,elem) {

                            onclickArray.push($(this).text());
                            //console.log(i2 + " text: " + $(this).text());

                            if ($(this).text().includes("Spelplats") ) {
                                //console.log("found at " + i2);

                                var string = $(this).text();
                                gamePlace = string.replace("Spelplats", "");
                                //console.log(gamePlace);
                                for (var j = i2; j > 0; j--) {
                                    if (onclickArray[j].includes("Detaljer")) {
                                        foundString = onclickArray[j];
                                        j = 0;
                                    }
                                }
                            }
                        });

                        console.log("found string: " + foundString);
                        var foundObject = objectify(foundString, "", gamePlace);
                        //console.log("a foundobject: " + foundObject.date + ", " + foundObject.homeTeamName + " - " + foundObject.awayTeamName);
                        //console.log(foundObject);
                        dbo.collection(series).updateOne(
                            {   date: foundObject.date,
                                homeTeamName: foundObject.homeTeamName,
                                awayTeamName: foundObject.awayTeamName
                            },
                            {$set: { gameLocation: foundObject.gameLocation }
                            },
                            function(err, res) {
                                if (err) {
                                    console.log("error here bud");
                                    throw err;
                                }
                                console.log(res.result.nModified + " documents updated");
                                dbUpdates++;
                                console.log("dbupdates: " + dbUpdates);
                                if (dbUpdates === res.length) {
                                    db.close();
                                }
                            }
                        );
                    }
                });
            }
        });
    });
}

function updateAllSeries() {
    MongoClient.connect(mongourl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");

        dbo.collection("links").find({}).toArray(function(err, result) {
           if (err) throw err;

           for (var i = 0; i < result.length; i++) {
               doRequestUpdateGames(result[i].link);
           }

           db.close();
        });

    });
}

function doRequestGetLinks() {
    var links = [];
    var url2 = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7916&k=LS7916&p=1";
    request(url2, function(err, resp, html) {
        if (!err && resp.statusCode === 200) {
            var $ = cheerio.load(html);

            console.log("RANNNNN");

            var divisionNumbers = [];


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

            console.log(links);

            for (var i = 0; i < links.length; i++) {
                links[i] = { link: links[i] };
            }

            MongoClient.connect(mongourl, function(err, db) {
                if (err) throw err;
                var dbo = db.db("mydb");

                dbo.collection("links").deleteMany({}, function(err, res) {
                    if (err) throw err;
                    console.log("Number of documents deleted: " + res.deletedCount);
                });
                dbo.collection("links").insertMany(links, function(err, res) {
                    if (err) throw err;
                    console.log("Number of documents inserted: " + res.insertedCount);
                });
            });
        }
    });
}

function linkify(link, gameID) {
    //före
    //https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7916&k=LS7916&p=1
    //efter
    //https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7916&k=LS7916&p=1&m=29776869&sy=0
    //https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7916&k=LS7916&p=1&m=29776863&sy=0
    return link + "&m=" + gameID + "&sy=0";
}


//for testing
function getSeriesNamesTest(links) {
    console.log("STARTING");
    for (var i = 0; i < links.length; i++) {
        request(links[i], function(err, resp, html) {
            if (!err && resp.statusCode === 200) {
                var $ = cheerio.load(html);



                $(".row h3").each(function(i,elem) {
                    console.log($(this).text());
                });


            }
        });
    }
}

function doRequestUpdateGames(seriesurl) {
    request(seriesurl, function(err, resp, html) {
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

                for (var i = 0; i < gameObjects.length; i++) {
                    dbo.collection(divisionName).find({gameID:gameObjects[i].gameID}).toArray(function(err, res) {
                        if(res[0].gameLocation === "place") {
                            console.log("gamelocation is place");
                        } else {
                            console.log("gamelocation is not place. set to database truth");
                            gameObjects[i].gameLocation = res[0].gameLocation;
                        }
                    });


                    dbo.collection(divisionName).updateOne(
                        {gameID:gameObjects[i].gameID},
                        { $set: {
                                date:           gameObjects[i].date,
                                homeTeamName:   gameObjects[i].homeTeamName,
                                awayTeamName:   gameObjects[i].awayTeamName,
                                homeTeamScore:  gameObjects[i].homeTeamScore,
                                awayTeamScore:  gameObjects[i].awayTeamScore,
                                gameID:         gameObjects[i].gameID,
                                gameLocation:   gameObjects[i].gameLocation,
                                gameLink:       linkify(seriesurl, gameObjects[i].gameID)
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

//updateAllSeriesGameLocations();
//doRequestUpdateGames("https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7916&k=LS7916&p=1");
updateSeriesGameLocations("Elitserien Herr");
//updateAllSeries();
//doRequestGetLinks();
/*setInterval(function() {
    var date = new Date();
    if ( date.getSeconds() % 30 === 0) {
        updateAllSeries();
        //doRequestUpdateGames();
    }
}, 1000);
*/
