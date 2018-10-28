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
var sem = require("semaphore")(20);
var syncrequest = require("sync-request");


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
  // below is for pure html (as in not pug/jade)
  /*res.status(500).json({
        message: err.message,
        error: err
    });*/
});

module.exports = app;

/*
    Vad är det som inte fungerar ännu? Jo jag minns inte... borde dokumenterat vad som behöver göras för att automatisera hela processen felfritt!

    Hur ska det fungera? Jo, databasen ska uppdateras kontinuerligt. Den består av:
        - En kollektion 'links' med länkar till alla serier. Ser ut såhär: 
            - name
            - link
            ~~~~~~~~~~~~~~~~
            Denna behöver uppdateras då och då. Antagligen inte så mycket under säsongen eftersom att alla serier är lagda.
            De ändringar som sker är om cuper läggs upp och om fortsättningsserier läggs upp. Detta är bara tillägg. De länkar som redan finns
            borde rimligen inte ändras. 
        
        - En kollektion för varje serie. Härstammar från links. Innehåller alla matcher i serien. 
        - En kollektion för Skarpe Nord. 
*/


var mongourl = "mongodb+srv://user1:pass1234PASS@cluster0-zdx0o.mongodb.net/test?retryWrites=true";
console.log("mongo url is: " + mongourl);
var url = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7931&k=LS7931&p=1";

function updateAllSeriesGameLocations(dbo, callback) {
    dbo.collection("links").find({}).toArray(function(err, res) {
        updateSeriesGameLocations(dbo, res, 0, res.length, callback);
    });
}



function updateSeriesGameLocations(dbo, linkList, currentIndex, maxIndex, callback) {
    if (currentIndex === maxIndex) return callback();
    var series = linkList[currentIndex].name;
    console.log("Updating locations for series: " + series);

    dbo.collection(series).find({}).toArray(function(err, res) {
        if (err) throw err;
        var foundString;
        var gamePlace;
        var dbUpdates = 0;
        var times = 0;
        for (var i = 0; i < res.length; i++) {
            times++;
            console.log("sending request: " + i);
            var requestResult = syncrequest("GET", res[i].gameLink);
            console.log("request returned: " + i);
            var html = requestResult.getBody();


            var $ = cheerio.load(html);

            var onclickArray = [];

            $(".row tr").each(function(i2,elem) {

                onclickArray.push($(this).text());
                //console.log(i2 + " text: " + $(this).text());

                if ($(this).text().includes("Spelplats") ) {
                    //console.log("found at " + i2);

                    var string = $(this).text();
                    gamePlace = string.replace("Spelplats", "");
                    console.log(gamePlace);
                    for (var j = i2; j > 0; j--) {
                        if (onclickArray[j].includes(" - ")) {
                            console.log("found string.........");
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
                function(err, result) {
                    console.log("reslength: " + res.length);
                    if (err) {
                        console.log("error here bud");
                        throw err;
                    }
                    console.log(result.result.nModified + " documents updated");
                    dbUpdates++;
                    console.log("dbupdates: " + dbUpdates);
                    if (dbUpdates === res.length) {
                        console.log("restarting");
                        updateSeriesGameLocations(dbo, linkList, currentIndex+1, maxIndex, callback);
                    }
                }
            );
        }
    });
}


function updateAllSeries() {
    MongoClient.connect(mongourl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");

        dbo.collection("links").find({}).toArray(function(err, result) {
           if (err) throw err;
           db.close();
           for (var i = 0; i < result.length; i++) {
               (function(tmp_i) {
                   console.log("Starting update on series: " + result[tmp_i].name);
                   doRequestUpdateGames(result[tmp_i].link);
               })(i);
           }
        });
    });
}

function makeArena(dbo, arenaName, callback) {
    dbo.collection("links").find({}).toArray(function(err, result) {
        if (err) throw err;
        insertGamesInSeriesIntoArenaCollection(dbo, arenaName, result, 0, result.length, callback);
        
    });
}

function insertGamesInSeriesIntoArenaCollection(dbo, arenaName, linkList, currentIndex, maxIndex, callback) {
    if (currentIndex === maxIndex) return callback();
    console.log("Looking in series: " + linkList[currentIndex].name);
    dbo.collection(linkList[currentIndex].name).find({gameLocation: arenaName}).toArray(function (err, res) {
        console.log(res);

        if (res.length > 0) {
            var nUpdates = 0;
            for (var i = 0; i < res.length; i++) {
                (function(tmp_id){
                    dbo.collection(arenaName).updateOne({gameID: res[tmp_id].gameID},
                        { $set: {
                                series:         linkList[currentIndex].name,
                                played:         res[tmp_id].played,
                                date:           res[tmp_id].date,
                                homeTeamName:   res[tmp_id].homeTeamName,
                                awayTeamName:   res[tmp_id].awayTeamName,
                                homeTeamScore:  res[tmp_id].homeTeamScore,
                                awayTeamScore:  res[tmp_id].awayTeamScore,
                                gameID:         res[tmp_id].gameID,
                                gameLocation:   res[tmp_id].gameLocation,
                                gameLink:       res[tmp_id].gameLink
                            }
                        },
                        {upsert: true},
                        function(err, result) {
                            if (err) throw err;
                            nUpdates++;
                            if (nUpdates === res.length) {
                                console.log("finished updating " + arenaName + " from series " + linkList[currentIndex].name);
                                console.log("restarting");
                                insertGamesInSeriesIntoArenaCollection(dbo, arenaName, linkList, currentIndex+1, maxIndex, callback);
                            }
                        });
                })(i);
            }
        } else {
            console.log("restarting");
            insertGamesInSeriesIntoArenaCollection(dbo, arenaName, linkList, currentIndex+1, maxIndex, callback);
        }
    });
}

function updateAllSeries2(dbo, callback) {
    dbo.collection("links").find({}).toArray(function(err, result) {
        if (err) throw err;
        doRequestUpdateGames2(dbo, result, 0, result.length, callback);
    });
}

function doRequestUpdateGames2(dbo, linkList, currentIndex, maxIndex, callback) {

    if (currentIndex === maxIndex) return callback();
    var seriesurl = linkList[currentIndex].link;
    var html = syncrequest("GET", seriesurl);
    var $ = cheerio.load(html.getBody());
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
        //console.log(matchID);
        matchID = matchID.slice(matchID.length-9, matchID.length-1);
        //console.log(matchID);
        oddRows.push([$(this).text(), matchID, "place"]);
    });

    $(".even").each(function (i, elem) {
        //console.log("An even game: ");
        var matchID = $(this).attr("onclick");
        matchID = matchID.slice(matchID.length-9, matchID.length-1);
        //console.log("matchID: " + matchID);
        //console.log("text: " + $(this).text());
        evenRows.push([$(this).text(), matchID, "place"]);
    });

    oddRows.join(", ");
    evenRows.join(", ");

    for (var i = 0; i < oddRows.length; i++) {
        gameRows[i] = oddRows[i];
    }

    for (var i = oddRows.length; i < oddRows.length + evenRows.length; i++) {
        gameRows[i] = evenRows[i-oddRows.length];
    }

    var gameObjects = [];
    for (var i = 0; i < gameRows.length; i++) {
        var temp = objectify((gameRows[i][0]), gameRows[i][1], gameRows[i][2]);
        if (temp === null) console.log("received null, not inserting this...");
        else gameObjects.push(temp);
    }

    gameObjects.sort(function(a,b) {
        if (a.date < b.date) return -1;
        else if (a.date > b.date) return 1;
        else return 0;
    });
    
    console.log("divisionName: " + divisionName);
    dbo.collection(divisionName).find({}).toArray(function(err, res) {
        //console.log(divisionName);
        //console.log(res);
        if (res.length === 0) {
            //console.log("hello");
            //we just created this collection
        } else {
            //collection here from before
            //we want to get the games' places and put in gameObjects
            for (var i = 0; i < gameObjects.length; i++) {
                (function(tmp_id){
                    dbo.collection(divisionName).find({ gameID: gameObjects[tmp_id].gameID }).toArray(function(err, res) {
                        gameObjects[tmp_id].gameLocation = res[0].gameLocation;
                    });
                })(i);

            }

        }
        if (res.length !== gameObjects.length) {
            dbo.collection(divisionName).deleteMany({}, function(err, obj) {
                if (err) throw err;
                //console.log(obj.result.n + " documents deleted in " + divisionName);
            })
        }
        var nUpdates = 0;
        for (var i = 0; i < gameObjects.length; i++) {
            (function(tmp_id){
                dbo.collection(divisionName).updateOne({gameID: gameObjects[tmp_id].gameID},
                    { $set: {
                            played:         gameObjects[tmp_id].played,
                            date:           gameObjects[tmp_id].date,
                            homeTeamName:   gameObjects[tmp_id].homeTeamName,
                            awayTeamName:   gameObjects[tmp_id].awayTeamName,
                            homeTeamScore:  gameObjects[tmp_id].homeTeamScore,
                            awayTeamScore:  gameObjects[tmp_id].awayTeamScore,
                            gameID:         gameObjects[tmp_id].gameID,
                            //gameLocation:   gameObjects[tmp_id].gameLocation,
                            gameLink:       linkify(seriesurl, gameObjects[tmp_id].gameID)
                        }
                    },
                    {upsert: true},
                    function(err, res) {
                        if (err) throw err;
                        //console.log(res.result.nModified + " documents updated, nr " + tmp_id);
                        nUpdates++;
                        if (nUpdates === gameObjects.length) {
                            //console.log("now at i = " + i + ", closing db.");
                            console.log("finished updating " + divisionName);
                            doRequestUpdateGames2(dbo, linkList, currentIndex+1, maxIndex, callback);
                        }
                    });
            })(i);
        }
    });
}

function removeCollections(dbo, callback) {
    dbo.collections(function (err, collections) {
        for (var i = 0; i < collections.length; i++) {
            if (collections.length === 1) {
                callback();
            } else {
                (function(tmp_id) {
                if(collections[tmp_id].collectionName !== "links") {
                    dbo.collection(collections[tmp_id].collectionName).drop(function(err, delOK) {
                        if (err) throw err;
                        if (delOK) console.log(collections[tmp_id].collectionName + " deleted.")

                        if (tmp_id === collections.length-1) {
                            console.log("removecollections callback entered!");
                            callback();
                        }
                    });
                }
            })(i);
            }
        }
    });
}

function doRequestGetLinks(dbo, callback) {
    var links = [];
    var url2 = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD9753&k=LS9753&p=1";
    request(url2, function(err, resp, html) {
        if (!err && resp.statusCode === 200) {
            var $ = cheerio.load(html);

            console.log("RANNNNN");

            var linkObjects = [];


            $(".dropdown-menu li").each(function(i,elem) {
                var linkHtml = $(this).html();
                //console.log(linkHtml);
                var linkHtmlLink = linkHtml.substring(linkHtml.indexOf('"') + 1, linkHtml.lastIndexOf('"'));


                var linkHtmlName = linkHtml.substring(linkHtml.indexOf(">") + 1, linkHtml.lastIndexOf("<"));
                while (linkHtmlName.includes("&")) {
                    console.log(linkHtmlName);
                    if (linkHtmlName.includes("&#xE5;")) linkHtmlName = linkHtmlName.replace("&#xE5;", "å");
                    if (linkHtmlName.includes("&#xC5;")) linkHtmlName = linkHtmlName.replace("&#xC5;", "Å");
                    if (linkHtmlName.includes("&#xE4;")) linkHtmlName = linkHtmlName.replace("&#xE4;", "ä");
                    if (linkHtmlName.includes("&#xC4;")) linkHtmlName = linkHtmlName.replace("&#xC4;", "Ä");
                    if (linkHtmlName.includes("&#xF6;")) linkHtmlName = linkHtmlName.replace("&#xF6;", "ö");
                    if (linkHtmlName.includes("&#xD6;")) linkHtmlName = linkHtmlName.replace("&#xD6;", "Ö");
                    console.log(linkHtmlName);
                }

                if (linkHtmlLink.includes("SBF_SERIE_AVD")) {
                    linkObjects.push({
                        name: linkHtmlName,
                        link: linkHtmlLink.slice(32, linkHtmlLink.indexOf("&"))
                    });
                }
            });

            $(".enavd").each(function(i,elem) {
                var linkHtml = $(this).html();
                console.log(linkHtml);
                //console.log(linkHtml);
                var linkHtmlLink = linkHtml.substring(linkHtml.indexOf('"') + 1, linkHtml.lastIndexOf('"'));


                var linkHtmlName = linkHtml.substring(linkHtml.indexOf(">") + 1, linkHtml.lastIndexOf("<"));
                while (linkHtmlName.includes("&")) {
                    console.log(linkHtmlName);
                    if (linkHtmlName.includes("&#xE5;")) linkHtmlName = linkHtmlName.replace("&#xE5;", "å");
                    if (linkHtmlName.includes("&#xC5;")) linkHtmlName = linkHtmlName.replace("&#xC5;", "Å");
                    if (linkHtmlName.includes("&#xE4;")) linkHtmlName = linkHtmlName.replace("&#xE4;", "ä");
                    if (linkHtmlName.includes("&#xC4;")) linkHtmlName = linkHtmlName.replace("&#xC4;", "Ä");
                    if (linkHtmlName.includes("&#xF6;")) linkHtmlName = linkHtmlName.replace("&#xF6;", "ö");
                    if (linkHtmlName.includes("&#xD6;")) linkHtmlName = linkHtmlName.replace("&#xD6;", "Ö");
                    console.log(linkHtmlName);
                }

                if (linkHtmlLink.includes("SBF_SERIE_AVD")) {
                    linkObjects.push({
                        name: linkHtmlName,
                        link: linkHtmlLink.slice(50, linkHtmlLink.indexOf("&"))
                    });
                }
            });



            for (var i = 0; i < linkObjects.length; i++) {
                if (linkObjects[i].link.includes("X")) {
                    console.log("contains x, stop!!");
                    console.log(linkObjects[i]);
                    while(true){

                    }
                } else {
                    linkObjects[i].link = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD"
                        + linkObjects[i].link + "&k=LS"
                        + linkObjects[i].link + "&p=1";
                }

            }

            /*for (var i = 0; i < linkObjects.length; i++) {
                links.push("https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD"
                    + linkObjects[i].link + "&k=LS"
                    + linkObjects[i].link.substring(0,4) + "&p=1")
            }

            console.log("links below");
            console.log(links);*/

            console.log(linkObjects);

            console.log("Correcting myself...");
            linkObjects = correctLinks(linkObjects);



            /*for (var j = 0; j < links.length; j++) {
                links[j] = { link: links[j] };
            }*/

            dbo.collection("links").deleteMany({}, function(err, res) {
                if (err) throw err;
                console.log("Number of documents deleted: " + res.deletedCount);
            });
            dbo.collection("links").insertMany(linkObjects, function(err, res) {
                if (err) throw err;
                console.log("Number of documents inserted: " + res.insertedCount);
                callback();
            });
        }
    });
}

function correctLinks(linkArr) {
    for (var i = 0; i < linkArr.length; i++) {
        var html = syncrequest("GET", linkArr[i].link);
        var $ = cheerio.load(html.getBody());

        var divisionName = "";
        $(".row h3").each(function(i,elem) {
            divisionName = $(this).text();
        });

        console.log("Previous linkname was: " + linkArr[i].name);
        linkArr[i].name = divisionName;
        console.log("New linkname is: " + linkArr[i].name);
    }
    return linkArr;
}

function linkify(link, gameID) {
    //före
    //https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7916&k=LS7916&p=1
    //efter
    //https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7916&k=LS7916&p=1&m=29776869&sy=0
    //https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7916&k=LS7916&p=1&m=29776863&sy=0
    return link + "&m=" + gameID + "&sy=0";
}




function objectify(row, gameID, gameLocation) {
    if (row.includes("Detaljer")) {
        console.log(row);
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

        //console.log(date.toDateString());

        return {
            played: true,
            date: date,
            homeTeamName:stringHomeTeam,
            awayTeamName:stringAwayTeam,
            homeTeamScore:stringHomeScore,
            awayTeamScore:stringAwayScore,
            gameID: gameID,
            gameLocation: gameLocation
        };
    } else {
        if (row.includes(":")) {
            console.log("Row has ':' :'" + row + "'");
            console.log("Starting objectification...");
            console.log("input row: '" + row + "'");

            var string = row;
            string = string.replace("\n", "");
            string = string.replace("\n", "");
            string = string.replace("\n", "");

            console.log("Cutting complete. New string: '" + string + "'");

            string = string.replace(/\s*$/,"");

            console.log("Removed whitespaces at end: '" + string + "'");

            var colonIndex = string.indexOf(":");

            var stringTimeHour = string.slice(colonIndex-2, colonIndex).trim();
            var stringTimeMin = string.slice(colonIndex+1, colonIndex+3).trim();

            console.log("Hour: '" + stringTimeHour + "'");
            console.log("Min: '" + stringTimeMin + "'");

            var slashIndex = string.indexOf("/");
            var stringDay = string.slice(slashIndex-2, slashIndex).trim();
            var stringMonth = string.slice(slashIndex+1, slashIndex+3).trim();

            console.log("Day: '" + stringDay + "'");
            console.log("Month: '" + stringMonth + "'");

            var gameYear;
            var dateNow = new Date();

            if (Number(stringMonth) > 6) {
                gameYear = dateNow.getFullYear();
            } else {
                gameYear = dateNow.getFullYear()+1;
            }

            var date = new Date(gameYear, Number(stringMonth)-1, Number(stringDay),
                Number(stringTimeHour), Number(stringTimeMin));

            console.log(date.toDateString());

            var dashIndex = string.indexOf(" - ");
            console.log("dash at: " + dashIndex);

            var stringHomeTeam = string.slice(colonIndex+4, dashIndex);
            var stringAwayTeam = string.slice(dashIndex+3, string.length);
            console.log("home: '" + stringHomeTeam + "'");
            console.log("away: '" + stringAwayTeam + "'");

            return {
                played: false,
                date: date,
                homeTeamName:stringHomeTeam,
                awayTeamName:stringAwayTeam,
                homeTeamScore:"-",
                awayTeamScore:"-",
                gameID: gameID,
                gameLocation: gameLocation
            };
        } else if (containsDayString(row)) {
            console.log("Row has no ':' :'" + row + "'");

            var string = row;
            string = string.replace("\n", "");
            string = string.replace("\n", "");
            string = string.replace("\n", "");

            console.log("Cutting complete. New string: '" + string + "'");

            string = string.replace(/\s*$/,"");

            console.log("Removed whitespaces at end: '" + string + "'");

            var slashIndex = string.indexOf("/");
            var stringDay = string.slice(slashIndex-2, slashIndex).trim();
            var stringMonth = string.slice(slashIndex+1, slashIndex+3).trim();
            console.log("day: " + stringDay + ", month: " + stringMonth);

            var dashIndex = string.indexOf(" - ");
            var stringHomeTeam = string.slice(slashIndex+4, dashIndex);
            var stringAwayTeam = string.slice(dashIndex+3, string.length);

            console.log("home: '" + stringHomeTeam + "'");
            console.log("away: '" + stringAwayTeam + "'");

            var gameYear;
            var dateNow = new Date();

            if (Number(stringMonth) > 6) {
                gameYear = dateNow.getFullYear();
            } else {
                gameYear = dateNow.getFullYear()+1;
            }

            var date = new Date(gameYear, Number(stringMonth)-1, Number(stringDay),
                0, 0);

            console.log("date: " + date.toString());

            return {
                played: false,
                date: date,
                homeTeamName:stringHomeTeam,
                awayTeamName:stringAwayTeam,
                homeTeamScore:"-",
                awayTeamScore:"-",
                gameID: gameID,
                gameLocation: gameLocation
            };
        } else {
            // Row does not contain any date, and game has not been played. So only, for example: "IFK Kungälv - Kareby IS"
            // Let's just ignore these games...
            console.log("Game found that is to be ignored!" + row);
            return null;
        }
    }
}

function containsDayString(str) {
    if (str.includes("Mån ") || str.includes("Tis ") || str.includes("Ons ")
    || str.includes("Tor ") || str.includes("Fre ") || str.includes("Lör ") || str.includes("Sön ")) {
        return true;
    } else return false;
}

// start database refreshing at a specific time. don't let the function be called twice via runningDone variable and 30.000s timer set
function startBackend() {
    var runningDone = false;
    setInterval(function() {
        var date = new Date();
        if (date.getHours() === 2 && date.getMinutes() === 0 && !runningDone) {
            refreshDatabase();
            runningDone = true;
        } else {
            runningDone = false;
        }
    }, 30000);
}

function refreshDatabase() {
    /*
        The functions we have to work with are: 
            - doRequestGetLinks
            - updateAllSeries2
            - updateAllSeriesGameLocations
            - makeArena
    */

   MongoClient.connect(mongourl, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");

    console.log("Starting database refresh...");
    console.log("Removing collections...");
    removeCollections(dbo, function() {
        console.log("Collections removed. Updating links...");
        doRequestGetLinks(dbo, function() {
            console.log("Links updated. Getting all series...");
            updateAllSeries2(dbo, function() {
                console.log("All series gathered. Now getting game locations...");
                updateAllSeriesGameLocations(dbo, function() {
                    console.log("All game locations updated... making arena...");
                    makeArena(dbo, 'Skarpe Nord', function() {
                        console.log("Arena-making done! Database update done!")
                        db.close();
                    });
                });
            });
        });
    });

    });

    
}

startBackend();

// ping myself every 5 minutes to make sure website doesnt sleep (heroku)
var http = require("http");
setInterval(function() {
    http.get("http://skarpetest.herokuapp.com");
}, 300000); // every 5 minutes (300000)

var kskurl = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7931&k=LS7931&p=1";
var eliturl = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD9753&k=LS9753&p=1";
var dameliturlold = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7932&k=LS7932&p=1";
var div1väst1819 = "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD9778&k=LS9778&p=1";

//var arr = [{link: "https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD10288&k=LS10288&p=1"}];
//doRequestUpdateGames2(arr, 0, 1);

//testSyncReq();
//newTestDoRequestUpdateGames(dameliturlold);
//updateAllSeriesGameLocations();
//doRequestUpdateGames("https://www.profixio.com/fx/serieoppsett.php?t=SBF_SERIE_AVD7916&k=LS7916&p=1");
//updateSeriesGameLocations("Division 1 Västra");
//updateAllSeriesGameLocations();
//updateAllSeries2();
//makeArena("Skarpe Nord");
//doRequestGetLinks();
//removeCollections();
//TESTupdateSeriesGameLocations("Elitserien Herr");
/*setInterval(function() {
    var date = new Date();
    if ( date.getSeconds() % 30 === 0) {
        updateAllSeries();
        //doRequestUpdateGames();
    }
}, 1000);
*/

/*
 When recreating the database, which is necessary at this moment in time, run: 
    removecollections, 
    dorequestgetlinks, 
    updateallseries2,
    updateallseriesgamelocations,
    makearena(skarpe).

*/

