var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 访问笔记界面的主界面
 */
router.get('/', function (request, response, next) {

  db.all("select note.*, notebook.nb_name from note, notebook where note.nb_id = notebook.nb_id", function (err, res) {
    if (err) {
      console.log(err);
      response.render('error');
    } else {
      console.log(JSON.stringify(res));
      response.render('notes', {note_data: res});
    }
  });
});


/**
 * 保存／新建笔记
 */
router.post('/save_note', function (request, response, next) {

  // 获取当前日前时间，并进行转换后存入数据库
  var now_datetime = new Date().toISOString();
  var date_time_separator = now_datetime.indexOf("T");
  var date_string = now_datetime.substring(0, date_time_separator);
  var time_string = now_datetime.substring(date_time_separator + 1, date_time_separator + 9);
  var datetime = date_string + " " + time_string;
  console.log("NOW DATETIME: " + datetime);

  var request_body = request.body;
  var sql;
  if (request_body.note_id === -1) {
    // 这是一条新建的笔记
    sql = "insert note note('note_name', 'nb_id', 'content', 'is_public', 'update_time', 'tag') values('" +
      request_body.note_name + "', '" + request_body.nb_id + "', '" + request_body.content +
      "', '0', '" + datetime + "', '" + request_body.note_tag + "')";
  } else {
    // 此条笔记是在原来的基础上修改
    sql = "update note set note_name = '" + request_body.note_name + "', tag = '" + request_body.note_tag +
      "', content = '" + request_body.content + "', update_time = '" + datetime + "', nb_id = '" + request_body.nb_id +
      "' where note_id = '" + request_body.note_id + "'";
  }
  console.log(sql);

  db.all(sql, function (err, res) {
    if (err) {
      console.log(err);
      response.render('error');
    } else {
      var callback_data = {
        note_name: request_body.note_name,
        update_time: datetime,
        content: request_body.content
      };
      response.send(callback_data);
    }
  });
});

/**
 * 分享／取消分享指定的笔记
 */
router.post('/share_note', function (request, response, next) {

  console.log("share begin");
  var request_body = request.body;
  var sql = "update note set 'is_public' = '" + request_body.now_public + "' where note_id = '" + request_body.note_id + "'";
  console.log("share sql: " + sql);

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

/**
 * 删除指定的笔记
 */
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

/**
 * 访问一个专门的笔记条目
 */
router.get('/:cur_note_id', function (request, response, next) {

  console.log(request.params.cur_note_id);
  var sql = "select note.*, notebook.nb_name, notebook.nb_id from note, notebook where note.nb_id = notebook.nb_id and " +
    "note_id = '" + request.params.cur_note_id + "'";

  db.all(sql, function (err, res) {
    if (err) {
      console.log(err);
      response.render('error');
    } else {
      console.log(JSON.stringify(res));
      response.send(res);
    }
  });
});

module.exports = router;
