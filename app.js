//入口文件
//加载express模块
var express = require('express');
//加载模版处理模块，实现前后端的分离
var swig = require('swig');
//加载数据库
var mongoose = require('mongoose');

//http.createServer
var app = express();

//设置静态文件托管（静态处理）
app.use('/public',express.static(__dirname+'/public'));

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

