var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 用户管理的主界面
 */
router.get('/', function (request, response, next) {
  if (request.session.cur_user) {
    console.log("--------- LOG IN: " + request.session.cur_user);
    if (request.session.cur_user_type === 1) {
      db.all("select * from user where is_admin = 0", function (err, res) {
        if (err) {
          console.log(err);
          response.render('error');
        } else {
          console.log(JSON.stringify(res));
          response.render('admin_index', {user_data: res, cur_user: request.session.cur_user});
        }
      });
    } else {
      // 普通用户没有权限访问管理员界面
      response.render("error", {message: "您的账号暂没有访问此页面的权限！"});
    }
  } else {
    console.log("--------- NOT LOG IN");
    response.render("home");
  }
});

module.exports = router;
