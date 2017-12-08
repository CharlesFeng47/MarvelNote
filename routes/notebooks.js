var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/* GET home page. */
router.get('/', function (request, response, next) {

  db.all("select * from notebook", function (err, res) {
    if (err) console.log(err);
    else console.log(JSON.stringify(res));
  });

  response.render('notebooks');
});

/* add a notebook */
router.post('/add_nb', function (request, response, next) {

  var request_body = request.body;
  var sql = "insert into notebook('nb_name', 'nb_icon_id', 'user_id') values('" + request_body.nb_name + "', '" +
    request_body.nb_icon_id + "', '" + request_body.user_id + "')";

  db.all(sql, function (err, res) {
    if (err) {
      console.log(err);
      response.render('error')
    } else {
      console.log(JSON.stringify(res));
      response.send("add success");
    }
  });
});

/* delete a notebook */
router.post('/delete_nb', function (request, response, next) {

  var request_body = request.body;
  var sql = "delete from notebook where nb_id = '" + request_body.nb_id + "'";

  db.all(sql, function (err, res) {
    if (err) {
      console.log(err);
      response.render('error')
    } else {
      console.log(JSON.stringify(res));
      response.send('delete success');
    }
  });
});

module.exports = router;
