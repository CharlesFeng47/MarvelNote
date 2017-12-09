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
      placeholder: 'write here...',
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
