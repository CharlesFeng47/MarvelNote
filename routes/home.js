var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 登录注册主界面
 */
router.get('/', function(request, response, next) {
  console.log("GET HOME");

  db.all("select * from notebook", function (err, res) {
    if (err) {
      console.log(err);
      response.render('error');
    } else {
      console.log(JSON.stringify(res));
      response.render('home', {nb_data: res});
    }
  });

});

module.exports = router;
