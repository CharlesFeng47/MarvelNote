var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/* GET home page. */
router.get('/', function(req, res, next) {

  db.all("select * from user", function (err, res) {
    if (err) console.log(err);
    else console.log(JSON.stringify(res));
  });

  res.render('index', { title: 'Express', aa: '<h4>aa</h4>' });
});

module.exports = router;
