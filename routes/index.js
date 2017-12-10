var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/* GET home page. */
router.get('/', function(request, response, next) {
  console.log("GET HOME");

  // db.all("select * from notebook limit 1", function (err, res) {
  //   if (err) {
  //     console.log(err);
  //     response.render('error');
  //   } else {
  //     console.log(JSON.stringify(res));
  //     response.render('index', {has_note: false, default_nb: res});
  //   }
  // });
  response.render('admin_index');

});

module.exports = router;
