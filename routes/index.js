var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 新建一条笔记
 */
router.get('/', function(request, response, next) {
  if (request.session.cur_user) {
    console.log("--------- LOG IN: " + request.session.cur_user);
    if (request.session.cur_user_type === 0) {
      db.all("select * from notebook limit 1", function (err, res) {
        if (err) {
          console.log(err);
          response.render('error');
        } else {
          console.log(JSON.stringify(res));
          response.render('index', {has_note: false, default_nb: res, cur_user: request.session.cur_user});
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

module.exports = router;
