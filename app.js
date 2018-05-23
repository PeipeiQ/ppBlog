//入口文件
//加载express模块
var express = require('express');
//加载模版处理模块，实现前后端的分离
var swig = require('swig');
//加载数据库
var mongoose = require('mongoose');
//加载bodyparser，用来处理post提交过来的数据
var bodyParser =  require('body-parser');
//http.createServer
var app = express();
//加载cookies模块
var cookies = require('cookies')

//设置静态文件托管（静态处理）
app.use('/public',express.static(__dirname+'/public'));
//bodyParser设置
app.use(bodyParser.urlencoded({extended:true}));
//cookies
app.use(function (req,res,next) {
  req.cookies = new cookies(req,res);
  if(req.cookies.get('userInfo')){
    //如果携带有cookie信息，解析用户登录的cookie信息，并保存在req
    try {
      req.userInfo = JSON.parse(req.cookies.get('userInfo'));
    }catch (e){

    }
  }
  next();
})
//设置模版
app.engine('html',swig.renderFile);
app.set('views','./view');
app.set('view engine','html');
swig.setDefaults({cache:false});

// //首页根路径(动态处理)
// app.get('/',function (req,res,next) {
//   //res.send('pp');
//   //读取指定目录下的指定文件
//   res.render('index');
// });

//根据不同的功能，划分模块
 app.use('/',require('./routers/main'));     //前台
 app.use('/api',require('./routers/api'));
 app.use('/admin',require('./routers/admin'));   //后台

mongoose.connect('mongodb://localhost:27018/blog',function (err) {
  if(err){
    console.log('数据库连接失败')
  }else {
    console.log('数据库连接成功')
    app.listen(7070);
  }
});

// app.listen(7070);
