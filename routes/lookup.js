var express = require('express');
var router = express.Router();

var sqlite = require('sqlite3');
var db = new sqlite.Database('./MarvelNote.sqlite');

/**
 * 查看一条笔记
 */
router.get('/', function (request, response, next) {
  if (request.session.cur_user) {
    console.log("--------- LOG IN: " + request.session.cur_user);
    if (request.session.cur_user_type === 0) {
      console.log(request.query);

      var sql;
      if (typeof request.query.readonly !== 'undefined') {
        // 从参数重接受内容，并只呈现

        response.render('lookup', {
          has_note: false,
          has_nb: false,
          readonly: true,
          read_data: {
            title: request.query.title,
            author: request.query.author,
            tag: request.query.tag,
            content: request.query.content
          },
          default_nb: [{
            "nb_id": -1,
            "nb_name": ""
          }],
          cur_user: request.session.cur_user
        });

      }
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
