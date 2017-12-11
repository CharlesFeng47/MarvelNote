var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 用户管理的主界面
 */
router.get('/', function (request, response, next) {
  db.all("select * from user where is_admin = 0", function (err, res) {
    if (err) {
      console.log(err);
      response.render('error');
    } else {
      console.log(JSON.stringify(res));
      response.render('admin_index', {user_data: res});
    }
  });
});


/**
 * 修改用户密码
 */
router.post('/modify', function (request, response, next) {

  console.log("modify begin");
  var request_body = request.body;
  var sql = "update user set password = '" + request_body.user_pwd + "' where id = '" + request_body.user_id + "'";
  console.log(sql);

  db.all(sql, function (err, res) {
    if (err) {
      console.log(err);
      response.render('error');
    } else {
      console.log(JSON.stringify(res));
      response.send("modify success");
    }
  });
});

/**
 * 删除用户
 */
router.post('/delete', function (request, response, next) {

  console.log("delete begin");
  var request_body = request.body;
  var sql = "delete from user where id = '" + request_body.user_id + "'";
  console.log(sql);

  db.all(sql, function (err, res) {
    if (err) {
      console.log(err);
      response.render('error');
    } else {
      console.log(JSON.stringify(res));
      response.send("delete success");
    }
  });
});

/**
 * 根据用户ID获取用户密码
 */
router.get('/:cur_user_id', function (request, response, next) {

  console.log("get begin");
  console.log(request.params.cur_user_id);
  var sql = "select password from user where id = '" + request.params.cur_user_id + "'";
  console.log(sql);

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
