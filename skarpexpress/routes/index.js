var express = require('express');
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;

var mongourl = "mongodb://localhost:27017/";

/* GET home page. */
router.get('/', function(req, res, next) {
  var resultArray = [];
  MongoClient.connect(mongourl, function(err, db) {
    if (err) throw err;
    var nowDate = new Date();

    dbo = db.db("mydb");
    var cursor = dbo.collection("Skarpe Nord").find();
    cursor.forEach(function(doc, err) {
      if (err) throw err;
      //console.log("hello");
      resultArray.push(doc);
    }, function() {
      db.close();
      res.render('index', {gamesjson: JSON.stringify(resultArray), games: resultArray});
      // below for pure html
      //res.send("index");
    });
  });
});

module.exports = router;

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return week number
    return weekNo;
}
