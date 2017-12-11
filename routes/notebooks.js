var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 笔记本主页的界面
 */
router.get('/', function (request, response, next) {
  if (request.session.cur_user) {
    console.log("--------- LOG IN: " + request.session.cur_user);
    if (request.session.cur_user_type === 0) {
      db.all("select * from notebook", function (err, res) {
        if (err) {
          console.log(err);
          response.render('error');
        } else {
          console.log(JSON.stringify(res));
          response.render('notebooks', {nb_data: res, cur_user: request.session.cur_user});
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
 * 获取所有的笔记本信息
 */
router.get('/all', function (request, response, next) {

  db.all("select * from notebook", function (err, res) {
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
 * 添加一本笔记本
 */
router.post('/add_nb', function (request, response, next) {

  var request_body = request.body;
  var sql = "insert into notebook('nb_name', 'nb_icon_id', 'user_id', 'description') values('" + request_body.nb_name + "', '" +
    request_body.nb_icon_id + "', '" + request_body.user_id + "', '" + request_body.nb_description + "')";

  db.all(sql, function (err, res) {
    if (err) {
      console.log(err);
      response.render('error')
    } else {
      console.log(JSON.stringify(res));
      response.send("add success");
    }
  });
});

/**
 * 删除一本笔记本
 */
router.post('/delete_nb', function (request, response, next) {

  var request_body = request.body;
  var sql = "delete from notebook where nb_id = '" + request_body.nb_id + "'";

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
