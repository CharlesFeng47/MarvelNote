var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/* GET home page. */
router.get('/', function (request, response, next) {

  db.all("select * from note", function (err, res) {
    if (err) {
      console.log(err);
      response.render('error');
    } else {
      console.log(JSON.stringify(res));
      response.render('notes', {note_data: res});
    }
  });
});

/* share a note */
router.post('/share_note', function (request, response, next) {

  var request_body = request.body;
  var sql = "update note set 'is_public' = '" + request_body.now_public + "' where note_id = '" + request_body.note_id + "'";

  db.all(sql, function (err, res) {
    if (err) {
      console.log(err);
      response.render('error')
    } else {
      console.log(JSON.stringify(res));
      response.send('change share state success');
    }
  });
});

/* delete a note */
router.post('/delete_note', function (request, response, next) {

  var request_body = request.body;
  var sql = "delete from note where note_id = '" + request_body.note_id + "'";

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
