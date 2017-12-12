var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

var async = require('async');

/**
 * 访问朋友圈界面的主界面
 */
router.get('/', function (request, response, next) {

  if (request.session.cur_user) {
    console.log("--------- LOG IN: " + request.session.cur_user);
    if (request.session.cur_user_type === 0) {
      console.log(request.query);

      // 所有普通用户
      db.all("select * from user where is_admin = 0 and id != '" + request.session.cur_user + "'", function (err, all_users) {
        if (err) {
          console.log(err);
          response.render('error');
        } else {
          console.log("all_users: " + JSON.stringify(all_users));

          // 当前用户关注的用户
          db.all("select * from relationship where following = '" + request.session.cur_user + "'", function (err, now_following_users) {
            if (err) {
              console.log(err);
              response.render('error')
            } else {
              console.log("now_following_users: " + JSON.stringify(now_following_users));

              var all_public_notes;
              var upvote_data = [];
              async.parallel([
                // user_data
                function () {
                  var user_data = [];
                  var user_data_index = 0;
                  // 对所有用户在关于当前用户是否关注方面进行区分
                  for (var i = 0; i < all_users.length; i++) {
                    var is_following = false;
                    for (var j = 0; j < now_following_users.length; j++) {
                      if (all_users[i].id === now_following_users[j].be_followed) {
                        is_following = true;
                      }
                    }

                    user_data[user_data_index] = {
                      user_id: all_users[i].id,
                      is_following: is_following
                    };
                    user_data_index++;
                  }
                  console.log("user_data: " + JSON.stringify(user_data));
                }
                // share_notes_data 和 upvote_data
                , function () {
                  async.series([
                    // share_notes_data
                    function () {
                      console.log("开始串行1");
                      var all_public_notes_sql = "select note.*, user_id from note, notebook, relationship where following = '"
                        + request.session.cur_user + "' " + "and be_followed = notebook.user_id and notebook.nb_id = note.nb_id "
                        + "order by update_time desc";

                      async.series([
                        function () {
                          db.all(all_public_notes_sql, function (err, res) {
                            if (err) {
                              console.log(err);
                            } else {
                              all_public_notes = res;
                              console.log("all_public_notes: " + JSON.stringify(all_public_notes));
                            }
                          });
                          console.log("串行1.1 return");
                        }
                      ]);
                      console.log("串行1 return");
                    },
                    // upvote_data
                    function () {
                      console.log("开始串行2");

                      // 对每一公开的笔记进行点赞统计
                      var share_note_index = 0;

                      async.whilst(
                        function () {
                          return share_note_index < all_public_notes.length;
                        },
                        function () {
                          console.log(JSON.stringify(all_public_notes[i]));
                          var each_upvote_list = get_upvote_data(all_public_notes[i], request.session.cur_user);

                          var has_upvoted = false;
                          for (var j = 0; j < each_upvote_list.length; j++) {
                            if (each_upvote_list[j] === cur_user) {
                              has_upvoted = true;
                            }
                          }

                          upvote_data[share_note_index] = {
                            upvote_num: each_upvote_list.length,
                            has_upvoted: has_upvoted
                          };
                          share_note_index++;
                        },
                        function (err) {
                          console.log(err);
                        }
                      );
                    }
                  ], function (err, results) {
                  });
                }
              ], function (err, results) {
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
 * 点赞／取消点赞
 */
router.post('/upvote', function (request, response, next) {

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

/**
 * 根据一条分享笔记记录，获取笔记的点赞数据
 */
function get_upvote_data(one_share_note, cur_user) {
  var each_upvote_sql = "select * from upvote where note_id = '" + one_share_note.note_id + "'";

  async.series([
    function (cb) {
      db.all(each_upvote_sql, function (err, each_upvote_list) {
        if (err) {
          console.log(err);
        } else {
          console.log("each_upvote_list: " + JSON.stringify(each_upvote_list));
          return each_upvote_list;
        }
      });
    }
  ], function (err, results) {
    console.log("-----------------callback results");
    return results;
  });
}

module.exports = router;
