// 初始化 summernote
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


// body 内点击，退出 summernote
$("body").click(function (e) {
  var markupStr = $('.mynote').summernote('code');
  // alert(markupStr);
  $('.mynote').summernote('destroy');
  if (e) e.stack;
});

// body 外点击，退出 summernote
$(".fill_space").click(function (e) {
  var markupStr = $('.mynote').summernote('code');
  // alert(markupStr);
  $('.mynote').summernote('destroy');
  if (e) e.stack;
});

// 保存当前文档中的内容 TODO 待确定笔记本的选择
$('.save_now_note').click(function () {
  var note = $(this).parent().parent();

  // summer_note先保存
  $('.mynote').summernote('destroy');
  var note_data = {
    note_id: note.find('.note_id').html(),
    note_name: note.find('#note_name_input').val(),
    note_tag: note.find('#note_tag_input').val(),
    content: note.find('.mynote').html()
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

// 丢弃当前文档中的内容
$('.discard_now_note').click(function () {
  var note = $(this).parent().parent();

  note.find('#note_name_input').val("");
  note.find('#note_tag_input').val("");
  note.find('.mynote').html("");
});
