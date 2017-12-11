/**
 * 注册
 */
$('.sign_up').click(function () {
  var data = {
    id: $('#input_id').val(),
    pwd: $('#input_pwd').val()
  };

  $.ajax({
    type: "post",
    async: true,
    url: "/sign_up",
    data: data,

    success: function (result) {
      if (result === "-1") {
        alert("该用户编号已被注册，请使用其他编号！");
      } else {
        alert("注册成功！");

      }
    },
    error: function (result) {
      alert("错误" + result);
    }
  });
});

/**
 * 登录
 */
$('.log_in').click(function () {
  var data = {
    id: $('#input_id').val(),
    pwd: $('#input_pwd').val()
  };

  $.ajax({
    type: "post",
    async: true,
    url: "/log_in",
    data: data,

    success: function (result) {
      if (result === "-1") {
        alert("该用户编号还未被注册，请注册后再登录！");
      } else if (result === "0") {
        alert("普通用户登录成功！");
      } else if (result === "1") {
        alert("密码错误！")
      } else if (result === "2") {
        alert("管理员登录成功！")
      }
    },
    error: function (result) {
      alert("错误" + result);
    }
  });
});