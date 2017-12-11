/**
 * 修改用户密码
 */
$('.user_edit').click(function () {
  var cur_user_id = $(this).parent().parent().parent().parent().find('.user_id').html();
  alert(cur_user_id);

  $.ajax({
    type: "get",
    async: true,
    url: "/users/" + cur_user_id,

    success: function (result) {
      var cur_user_pwd = result[0].password;
      layui.define(['layer'], function (exports) {
        var layer = layui.layer;

        var html_content =
          '<div class="layui-bg-black" style="width: 570px;height: 280px;margin: 10px 15px;">\n' +
          '    <!-- 用户iD -->\n' +
          '    <div class="layui-col-xs12" style="margin-left: 10px;margin-top: 10px;">\n' +
          '        <label class="layui-col-xs3" style="font-size: 18px;color: #BDC0BA">当前用户 ID</label>\n' +
          '        <div class=" layui-col-xs7 note_title_outer" style="margin-top: -4px;">\n' +
          '            <div class=" new_nb_item_word" style="font-size: 18px">'
          + cur_user_id
          + '</div>' +
          '        </div>\n' +
          '    </div>\n' +
          '    <!-- 用户密码 -->\n' +
          '    <div class="layui-col-xs12" style="margin-left: 10px;">\n' +
          '        <label class="layui-col-xs3" style="font-size: 18px;color: #BDC0BA">当前用户密码</label>\n' +
          '        <div class=" layui-col-xs7 note_title_outer" style="margin-top: -4px;">\n' +
          '            <div class=" new_nb_item_word" style="font-size: 18px">'
          + cur_user_pwd
          + '</div>' +
          '        </div>\n' +
          '    </div>\n' +
          '    <hr class="layui-bg-gray" style="margin-left: 10px;margin-right: 10px;">\n' +
          '    <!-- 修改密码 -->\n' +
          '    <div class="layui-col-xs12" style="margin-left: 10px;">\n' +
          '        <label class="layui-col-xs3" style="font-size: 18px;color: #BDC0BA">修改密码</label>\n' +
          '        <div class="layui-col-xs7 note_title_outer" style="margin-top: -4px;">\n' +
          '            <input id="user_new_pwd_1" type="text" maxlength="20" class=" new_nb_item_word" ' +
          'placeholder="修改后的密码（最长20个字）" style="font-size: 18px">\n' +
          '        </div>\n' +
          '    </div>\n' +
          '    <!-- 确认修改密码 -->\n' +
          '    <div class="layui-col-xs12" style="margin-left: 10px;">\n' +
          '        <label class="layui-col-xs3" style="font-size: 18px;color: #BDC0BA">确认密码</label>\n' +
          '        <div class=" layui-col-xs7 note_title_outer" style="margin-top: -4px;">\n' +
          '            <input id="user_new_pwd_2" type="text" maxlength="20" class=" new_nb_item_word" ' +
          'placeholder="修改后的密码（最长20个字）" style="font-size: 18px">\n' +
          '        </div>\n' +
          '    </div>\n' +
          '</div>';

        // 调用模态框输入笔记本的姓名，并选择样式，再保存
        layer.open({
          type: 1,
          title: ['编辑用户', 'font-size:24px;color:#393D48'],
          content: html_content,
          skin: 'layui-layer-blu',
          area: ['600px', '360px'],
          move: false,
          shade: [0.75, '#000'],
          anim: 1,
          resize: false,
          btn: ['确认修改'],

          yes: function (index, layero) {
            var pwd1 = $('#user_new_pwd_1').val();
            var pwd2 = $('#user_new_pwd_2').val();

            if (pwd1 !== pwd2) {
              alert("两次密码输入不一致");
            } else {
              // 修改用户密码
              var data = {
                user_id: cur_user_id,
                user_pwd: pwd1
              };

              $.ajax({
                type: "post",
                async: true,
                url: "/users/modify",
                data: data,

                success: function (result) {
                  alert(result);
                  layer.close(index);
                },
                error: function (result) {
                  alert("错误" + result);
                }
              });
            }
          },
          cancel: function () {

          },
          closeBtn: 2
        });
      });
    },
    error: function (result) {
      alert("错误" + result);
    }
  });
});

/**
 * 删除用户
 */
$('.user_delete').click(function () {
  var this_user = $(this).parent().parent().parent().parent();
  var data = {
    user_id: this_user.find('.user_id').html()
  };

  $.ajax({
    type: "post",
    async: true,
    url: "/users/delete",
    data: data,

    success: function (result) {
      alert(result);

      // 动态修改用户界面
      // 得到第一个元素，比较两 note_id
      var first_uesr = $('.table_line').first();
      var is_first = first_uesr.find('.user_id').html() === this_user.find('.user_id').html();
      alert("比对结果：" + is_first);

      // 直接移除当前条目笔记的html
      this_user.empty();
      this_user.removeClass("table_line");
      if (is_first) {
        // 是第一个用户，删除后续的间隔html
        this_user.next().css("display", "none");
      } else {
        // 不是第一个用户，删除前序的间隔html
        this_user.prev().css("display", "none");
      }
    },
    error: function (result) {
      alert("错误" + result);
    }
  });
});