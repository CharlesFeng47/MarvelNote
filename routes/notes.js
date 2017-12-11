var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 访问笔记界面的主界面
 */
router.get('/', function (request, response, next) {

  if (request.session.cur_user) {
    console.log("--------- LOG IN: " + request.session.cur_user);
    if (request.session.cur_user_type === 0) {
      console.log(request.query);
      console.log(typeof request.query.nb_id === 'undefined');

      var sql;
      if (typeof request.query.nb_id === 'undefined') {
        sql = "select note.*, notebook.nb_name from note, notebook where note.nb_id = notebook.nb_id " +
          "and notebook.user_id = '" + request.session.cur_user + "' order by note.update_time desc";
      } else {
        sql = "select note.*, notebook.nb_name from note, notebook where note.nb_id = notebook.nb_id and note.nb_id = '"
          + request.query.nb_id + "'and notebook.user_id = '" + request.session.cur_user +  "' order by note.update_time desc";
      }

      console.log(sql);
      db.all(sql, function (err, res) {
        if (err) {
          console.log(err);
          response.render('error');
        } else {
          var wanted_notes = res;
          console.log(JSON.stringify(wanted_notes));

          if (wanted_notes.length === 0) {
            // 用户没有笔记本，呈现默认的笔记本、
            db.all("select * from notebook limit 1", function (err, res) {
              if (err) {
                console.log(err);
                response.render('error');
              } else {
                console.log(JSON.stringify(res));
                response.render('notes', {has_note: false, default_nb: res, cur_user: request.session.cur_user});
              }
            });
          } else {
            response.render('notes', {has_note: true, note_data: wanted_notes, cur_user: request.session.cur_user});
          }
        }
      });
    } else {
      // 管理员没有权限访问普通用户界面
      response.render("error", {message: "您的账号暂没有访问此页面的权限！"});
    }
  } else {
    console.log("--------- NOT LOG IN");
    response.render("home");
  }
});


/**
 * 保存／新建笔记
 */
router.post('/save_note', function (request, response, next) {
  var update_time = get_cur_datetime();
  var request_body = request.body;
  var sql;
  if (request_body.note_id === "-1") {
    // 这是一条新建的笔记
    sql = "insert into note('note_name', 'nb_id', 'content', 'is_public', 'update_time', 'tag') values('" +
      request_body.note_name + "', '" + request_body.nb_id + "', '" + request_body.content +
      "', '0', '" + update_time + "', '" + request_body.note_tag + "')";
  } else {
    // 此条笔记是在原来的基础上修改
    sql = "update note set note_name = '" + request_body.note_name + "', tag = '" + request_body.note_tag +
      "', content = '" + request_body.content + "', update_time = '" + update_time + "', nb_id = '" + request_body.nb_id +
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
        update_time: update_time,
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
  var update_time = get_cur_datetime();
  var request_body = request.body;
  var sql = "update note set is_public = '" + request_body.now_public + "', update_time = '" + update_time
    + "' where note_id = '" + request_body.note_id + "'";
  console.log("share sql: " + sql);

  db.all(sql, function (err, res) {
    if (err) {
      console.log(err);
      response.render('error')
    } else {
      console.log(JSON.stringify(res));
      response.send(update_time);
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
  var sql = "select note.*, notebook.nb_name from note, notebook where note.nb_id = notebook.nb_id and " +
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

/**
 * 获取当前日前时间，并进行转换后存入数据库
 */
function get_cur_datetime() {
  var now_datetime = new Date().toISOString();
  var date_time_separator = now_datetime.indexOf("T");
  var date_string = now_datetime.substring(0, date_time_separator);
  var time_string = now_datetime.substring(date_time_separator + 1, date_time_separator + 9);
  var datetime = date_string + " " + time_string;
  console.log("NOW DATETIME: " + datetime);
  return datetime;
}

module.exports = router;
