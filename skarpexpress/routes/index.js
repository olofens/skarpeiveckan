var express = require('express');
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");

var mongourl = "mongodb://localhost:27017/";

/* GET home page. */
router.get('/', function(req, res, next) {
  var resultArray = [];
  MongoClient.connect(mongourl, function(err, db) {
    if (err) throw err;
    dbo = db.db("mydb");
    var cursor = dbo.collection("väst-div2-games").find();
    cursor.forEach(function(doc, err) {
      if (err) throw err;
      resultArray.push(doc);
    }, function() {
      db.close();
      res.render('index', {games: resultArray});
    });
  });
});


module.exports = router;
