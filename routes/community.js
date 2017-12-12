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
          console.log("all_users" + JSON.stringify(all_users));

          // 当前用户关注的用户
          db.all("select * from relationship where following = '" + request.session.cur_user + "'", function (err, following) {
            if (err) {
              console.log(err);
              response.render('error')
            } else {
              console.log("following" + JSON.stringify(following));

              var user_data = [];
              var user_data_index = 0;
              // 对所有用户在关于当前用户是否关注方面进行区分
              for (var i = 0; i < all_users.length; i++) {
                var is_following = false;
                for (var j = 0; j < following.length; j++) {
                  if (all_users[i].id === following[j].be_followed) {
                    is_following = true;
                  }
                }

                user_data[user_data_index] = {
                  user_id: all_users[i].id,
                  is_following: is_following
                };
                user_data_index++;
              }

              // 我关注的用户中公开的笔记
              var all_public_notes_sql = "select note.*, user_id from note, notebook, relationship where following = '"
                + request.session.cur_user + "' " + "and be_followed = notebook.user_id and notebook.nb_id = note.nb_id "
                + " and note.is_public = 1 order by update_time desc";
              db.all(all_public_notes_sql, function (err, my_all_share_notes) {
                if (err) {
                  console.log(err);
                  response.render('error')
                } else {
                  console.log("my_all_share_notes: " + JSON.stringify(my_all_share_notes));
                  if (my_all_share_notes.length !== 0) {
                    // 先取出我点过的所有赞
                    var my_upvotw_sql = "select note_id from upvote where user_id = '" + request.session.cur_user + "'";
                    db.all(my_upvotw_sql, function (err, my_upvote) {
                      if (err) {
                        console.log(err);
                        response.render('error')
                      } else {
                        console.log("my_upvote" + JSON.stringify(my_upvote));

                        var share_notes_data = [];
                        // 对比查看我是否点过赞
                        for (var i = 0; i < my_all_share_notes.length; i++) {
                          var has_upvoted = false;
                          for (var j = 0; j < my_upvote.length; j++) {
                            if (my_all_share_notes[i].note_id === my_upvote[j].note_id) {
                              has_upvoted = true;
                            }
                          }
                          share_notes_data[i] = {
                            note: my_all_share_notes[i],
                            has_upvoted: has_upvoted
                          };
                        }

                        console.log("share_notes_data: " + JSON.stringify(share_notes_data));

                        response.render('community', {
                          user_data: user_data,
                          has_share_note: true,
                          share_notes_data: share_notes_data,
                          cur_user: request.session.cur_user
                        });

                      }
                    });
                  } else {
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

module.exports = router;
