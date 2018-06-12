
$(function(){
  $('.summernote').eq(0).summernote({
    height: 200,
    tabsize: 2,
    lang: 'zh-CN'
  }).summernote('code',$('#edit_description').val());

  $('.summernote').eq(1).summernote({
    height: 400,
    tabsize: 2,
    lang: 'zh-CN'
  }).summernote('code',$('#edit_content').val());
});

$('#edit_submit').on('click',function () {
  var des = $('.summernote').eq(0).summernote('code');
  var con = $('.summernote').eq(1).summernote('code');
  var categoryId = $('#category').val();
  var title = $('#title').val();
  var contentId = window.location.search.split('=')[1];

  //通过ajax提交请求
  $.ajax({
    type: 'post',
    url: '/admin/content/edit?id='+contentId,
    data: {
      category: categoryId,
      title: title,
      description: des,
      content: con,
    },
    dataType: 'json',
    success: function(result) {
      console.log(result);
      if(result.code==0){
        window.location.href='/admin/content';
      }

    }
  });
})