/**
 * 初始化 summer_note
 */
$(".note_div").click(function (e) {
  $('.mynote').summernote({
      lang: 'zh-CN',
      toolbar: [
        ['style', ['fontname', 'style']],
        ['font', ['bold', 'italic', 'underline', 'clear', 'strikethrough']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['insert', ['table', 'picture', 'fullscreen']]
      ],
      placeholder: '在这里开始记录您的笔记吧！',
      height: 545,
      minHeight: null,
      maxHeight: null,
      focus: true
    }
  );
  e.stopPropagation();
});


/**
 * 保存当前文档中的内容
 */
$('.save_now_note').click(function () {
  var note = $(this).parent().parent();

  // summer_note先保存
  $('.mynote').summernote('destroy');
  var note_data = {
    note_id: note.find('.note_id').html(),
    note_name: note.find('#note_name_input').val(),
    note_tag: note.find('#note_tag_input').val(),
    content: note.find('.mynote').html(),
    nb_id: note.find('.nb_id').html()
  };

  $.ajax({
    type: "post",
    async: true,
    url: "/notes/save_note",
    data: note_data,

    success: function (result) {
      // 动态修改当前样式
      var cur_save_now_note_id = note.find('.note_id').html();
      $('.brief_note').each(function () {
        if ($(this).find('.note_id').html() === cur_save_now_note_id) {
          $(this).find('.brief_note_title').html(result.note_name);
          $(this).find('.brief_note_time').html(result.update_time);
          $(this).find('.brief_note_content').html(result.content);
        }
      });
    },
    error: function (result) {
      alert("错误" + result);
    }
  });
});

/**
 * 丢弃当前文档中的内容，恢复为原来的内容
 */
$('.discard_now_note').click(function () {
  var note = $(this).parent().parent();
  $('.mynote').summernote('destroy');

  var selected_note = $('.note_selected');
  if (typeof selected_note.html() !== 'undefined') {
    note.find('#note_name_input').val(selected_note.find('.brief_note_title').html().trim());
    note.find('#note_tag_input').val(selected_note.find('.note_tag').html());
    note.find('.mynote').html(selected_note.find('.brief_note_content').html());
  } else {
    note.find('#note_name_input').val("");
    note.find('#note_tag_input').val("");
    note.find('.mynote').html("");
  }
});

/**
 * 更换笔记所在的笔记本
 */
$('#change_nb').click(function () {
  var cur_note_area = $(this).parent().parent();

  // 先从数据库中取出该用户的所有笔记本
  $.ajax({
    type: "get",
    async: true,
    url: "/notebooks/all",

    success: function (result) {
      // 将该用户的笔记本填充进去
      layui.define(['layer'], function (exports) {
        var layer = layui.layer;

        var layer_height = Math.ceil(result.length / 4) * 174.5 + 20;
        var html_content =
          '<div class="layui-bg-black" style="width: 570px;height: ' + layer_height + 'px;margin: 10px 15px;">\n' +
          '    <!-- 选择笔记本封面图片 -->\n' +
          '    <div class="layui-col-xs12" style="margin: 10px 10px;width: 550px;">\n';

        for (var i = 0; i < result.length; i++) {
          html_content
            += (
            '        <div class="select_cover layui-col-xs3 nb_cover_select">\n' +
            '            <img alt="Background" src="/images/nb_covers/notebook')
            + (result[i].nb_icon_id)
            + ('.png" style="max-width: 100%;padding: 5px;margin: 5px;">\n' +
              '            <p class="nb_id" style="display: none">')
            + (result[i].nb_id)
            + ('</p>\n' +
              '            <p class="nb_name layui-col-xs12" style="font-size: 12px;text-align: center">')
            + (result[i].nb_name)
            + ('</p>\n' +
              '        </div>\n');
        }

        html_content += ('</div></div>');

        // 调用模态框输入笔记本的姓名，并选择样式，再保存
        layer.open({
          type: 1,
          title: ['修改所属笔记本', 'font-size:24px;color:#393D48'],
          content: html_content,
          skin: 'layui-layer-blu',
          area: ['600px', '360px'],
          move: false,
          shade: [0.75, '#000'],
          anim: 1,
          resize: false,
          btn: ['确认修改'],

          success: function () {
            // 一开始设置原本的笔记本高亮
            var pre_nb_id = cur_note_area.find('.nb_id').html();
            $(".select_cover").each(function () {
              if ($(this).find('.nb_id').html() === pre_nb_id) {
                $(this).css("border", "3px solid #BDC0BA");
                $(this).addClass("cover_selected");
              }
            });

            // 点选封面之后要有改变
            $('.select_cover').click(function () {
              $(".select_cover").each(function () {
                $(this).css("border", "3px solid rgba(0, 0, 0, 0)");
                $(this).removeClass("cover_selected");
              });
              $(this).css("border", "3px solid #BDC0BA");
              $(this).addClass("cover_selected");
            });
          },
          yes: function (index, layero) {
            // 修改 note_area 的笔记本区域
            cur_note_area.find('.nb_id').html($('.cover_selected').find('.nb_id').html());
            cur_note_area.find('#note_nb').html($('.cover_selected').find('.nb_name').html());
            layer.close(index);
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
 * body 内点击，退出 summernote
 */
$("body").click(function (e) {
  var markupStr = $('.mynote').summernote('code');
  // alert(markupStr);
  $('.mynote').summernote('destroy');
  if (e) e.stack;
});

/**
 * body 外点击，退出 summernote
 */
$(".fill_space").click(function (e) {
  var markupStr = $('.mynote').summernote('code');
  // alert(markupStr);
  $('.mynote').summernote('destroy');
  if (e) e.stack;
});