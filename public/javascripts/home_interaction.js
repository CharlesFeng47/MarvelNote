/**
 * 注册
 */
$('.sign_up').click(function () {
  var data = {
    id: $('#input_id').val(),
    pwd: $('#input_pwd').val()
  };

  if (data.id === "" || data.pwd === "") {
    layui.define(['layer'], function (exports) {
      var layer = layui.layer;
      layer.alert("账号密码填写不完整，请输入完整！", {icon: 2, time: 1500});
    });

  } else {
    $.ajax({
      type: "post",
      async: true,
      url: "/sign_up",
      data: data,

      success: function (result) {
        if (result === "-1") {
          layui.define(['layer'], function (exports) {
            var layer = layui.layer;
            layer.alert("该用户编号已被注册，请使用其他编号！", {icon: 2, time: 1500});
          });
        } else {
          layui.define(['layer'], function (exports) {
            var layer = layui.layer;
            layer.alert("注册成功", {icon: 1, time: 1500});
          });
        }
      },
      error: function (result) {
        alert("错误" + result);
      }
    });
  }
});

/**
 * 登录
 */
$('.log_in').click(function () {
  var data = {
    id: $('#input_id').val(),
    pwd: $('#input_pwd').val()
  };

  if (data.id === "" || data.pwd === "") {
    layui.define(['layer'], function (exports) {
      var layer = layui.layer;
      layer.alert("账号密码填写不完整，请输入完整！", {icon: 2, time: 1500});
    });

  } else {
    $.ajax({
      type: "post",
      async: true,
      url: "/log_in",
      data: data,

      success: function (result) {
        if (result === "-1") {
          layui.define(['layer'], function (exports) {
            var layer = layui.layer;
            layer.alert("该用户编号还未被注册，请注册后再登录！", {icon: 2, time: 1500});
          });
        } else if (result === "0") {
          window.location.href = "/index";
        } else if (result === "1") {
          layui.define(['layer'], function (exports) {
            var layer = layui.layer;
            layer.alert("密码错误！", {icon: 2, time: 1500});
          });
        } else if (result === "2") {
          window.location.href = "/admin";
        }
      },
      error: function (result) {
        alert("错误" + result);
      }
    });
  }
});