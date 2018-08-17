var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;
var assert = require("assert");

var mongourl = "mongodb://localhost:27017";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
