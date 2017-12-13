var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 登录注册主界面
 */
router.get('/', function (request, response, next) {
  console.log("GET HOME");

  if (request.session.cur_user) {
    console.log("--------- LOG IN: " + request.session.cur_user + "  " + request.session.cur_user_type);
    if (request.session.cur_user_type === 0) {
      response.redirect("index");
    } else {
      response.redirect("admin");
    }
  } else {
    response.render("home");
  }

});

/**
 * 注册
 * @return "-1"：已被注册
 *          "0"：注册成功
 */
router.post('/sign_up', function (request, response, next) {

  // 先查询所有已注册普通用户信息，比对数据库中没有后再插入
  db.all("select * from user", function (err, res) {
    if (err) {
      console.log(err);
      response.render('error');
    } else {
      console.log(JSON.stringify(res));

      var request_body = request.body;
      var sign_up_id = request_body.id;
      var sign_up_pwd = request_body.pwd;

      var has_been_signed_up = false;
      for (var i = 0; i < res.length; i++) {
        var temp_user = res[i];
        if (temp_user.id === sign_up_id) {
          has_been_signed_up = true;
          response.send("-1");
        }
      }

      if (!has_been_signed_up) {
        // 插入数据库
        var now_datetime = new Date().toISOString();
        var date_time_separator = now_datetime.indexOf("T");
        var date_string = now_datetime.substring(0, date_time_separator);

        var sql = "insert into user('id', 'password', 'is_admin', 'join_date') values('" + sign_up_id + "', '" +
          sign_up_pwd + "', '0', '" + date_string + "')";
        console.log(sql);

        db.all(sql, function (err, res) {
          if (err) {
            console.log(err);
            response.render('error')
          } else {
            console.log(JSON.stringify(res));
            response.send("0");
          }
        });
      }
    }
  });
});

/**
 * 登录
 * @return "-1"：未被注册
 *          "0"：已注册且密码正确，登录成功【普通用户】
 *          "1"：已注册但密码不正确，登录失败
 *          "2"：已注册且密码正确，登录成功【管理员】
 */
router.post('/log_in', function (request, response, next) {

  // 先查询所有用户信息
  db.all("select * from user", function (err, res) {
    if (err) {
      console.log(err);
      response.render('error');
    } else {
      console.log(JSON.stringify(res));

      var request_body = request.body;
      var log_in_id = request_body.id;
      var log_in_pwd = request_body.pwd;

      var has_been_signed_up = false;
      for (var i = 0; i < res.length; i++) {
        var temp_user = res[i];
        if (temp_user.id === log_in_id) {
          has_been_signed_up = true;
          if (temp_user.password === log_in_pwd) {

            // 保存登录用户
            request.session.cur_user = log_in_id;
            request.session.cur_user_type = temp_user.is_admin;

            if (temp_user.is_admin === 1) {
              response.send("2");
            } else {
              response.send("0");
            }
          } else {
            response.send("1");
          }
        }
      }

      if (!has_been_signed_up) {
        response.send("-1");
      }
    }
  });
});

/**
 * 退出登录
 * @return "0"：成功退出登录
 */
router.post('/log_out', function (request, response, next) {
  console.log("exit");
  request.session.cur_user = null;
  request.session.cur_user_type = null;
  response.send("0");
});


module.exports = router;
