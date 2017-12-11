var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 标签管理的主界面
 */
router.get('/', function (request, response, next) {
  if (request.session.cur_user) {
    console.log("--------- LOG IN: " + request.session.cur_user);
    if (request.session.cur_user_type === 0) {
      var sql = "select distinct tag from note, notebook where note.nb_id = notebook.nb_id and notebook.user_id = '"
        + request.session.cur_user + "'";

      db.all(sql, function (err, res) {
        if (err) {
          console.log(err);
          response.render('error');
        } else {

          var no_space_tags = [];
          var no_space_tags_index = 0;
          for (var i = 0; i < res.length; i++) {
            var temp_tag = res[i].tag;
            if (temp_tag !== "") {
              no_space_tags[no_space_tags_index] = temp_tag;
              no_space_tags_index++;
            }
          }

          console.log(JSON.stringify(no_space_tags));
          response.render('tags', {tag_data: no_space_tags, cur_user: request.session.cur_user});
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
 * 删除一个标签
 */
router.post('/delete', function (request, response, next) {

  var request_body = request.body;
  var sql = "delete from note where tag = '" + request_body.tag_id + "'";

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
