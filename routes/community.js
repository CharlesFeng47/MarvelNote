var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 访问朋友圈界面的主界面
 */
router.get('/', function (request, response, next) {

  if (request.session.cur_user) {
    console.log("--------- LOG IN: " + request.session.cur_user);
    if (request.session.cur_user_type === 0) {
      console.log(request.query);

      // 所有普通用户
      db.all("select * from user where is_admin = 0 and id != '" + request.session.cur_user + "'", function (err, res) {
        if (err) {
          console.log(err);
          response.render('error');
        } else {
          var all_users = res;
          console.log(JSON.stringify(all_users));

          // 当前用户关注的用户
          db.all("select * from relationship where following = '" + request.session.cur_user + "'", function (err, res) {
            if (err) {
              console.log(err);
              response.render('error')
            } else {
              console.log(JSON.stringify(res));

              var user_data = [];
              var user_data_index = 0;
              // 对所有用户在关于当前用户是否关注方面进行区分
              for (var i = 0; i < all_users.length; i++) {
                var is_following = false;
                for (var j = 0; j < res.length; j++) {
                  if (all_users[i].id === res[j].be_followed) {
                    is_following = true;
                  }
                }

                user_data[user_data_index] = {
                  user_id: all_users[i].id,
                  is_following: is_following
                };
                user_data_index++;
              }

              var all_public_notes_sql = "select note.*, user_id from note, notebook, relationship where following = '"
                + request.session.cur_user + "' " + "and be_followed = notebook.user_id and notebook.nb_id = note.nb_id "
                + "order by update_time desc";
              db.all(all_public_notes_sql, function (err, res) {
                if (err) {
                  console.log(err);
                  response.render('error')
                } else {
                  console.log(JSON.stringify(res));
                  if (res.length !== 0) {
                    response.render('community', {
                      user_data: user_data,
                      has_share_note: true,
                      share_notes_data: res,
                      cur_user: request.session.cur_user
                    });
                  } else{
                    response.render('community', {
                      user_data: user_data,
                      has_share_note: false,
                      cur_user: request.session.cur_user
                    });
                  }
                }
              });
            }
          });
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
 * 关注／取消关注选定的用户
 */
router.post('/follow', function (request, response, next) {

  var request_body = request.body;
  var sql;
  if (request_body.now_following === 'true') {
    sql = "insert into relationship('be_followed', 'following') values('" + request_body.to_follow + "', '" + request.session.cur_user + "')";
  } else {
    sql = "delete from relationship where be_followed='" + request_body.to_follow + "' and following='" + request.session.cur_user + "'";
  }
  console.log(sql);

  db.all(sql, function (err, res) {
    if (err) {
      console.log(err);
      response.render('error')
    } else {
      console.log(JSON.stringify(res));
      response.send("follow state change success");
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

module.exports = router;
