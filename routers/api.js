var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require('../models/Contents');
var Message = require('../models/Message')

//统一返回格式
var responseData;

router.use(function (res, req, next) {
    responseData = {
        code: 0,
        message: ''
    };
    next();
})

router.get('/user', function (req, res, next) {
    res.send('aaaaauser');
});

//用户注册
/*
*  逻辑
*  1、用户名不能为空
*  2、密码不能为空
*  3、两次密码必须一致
*
*  数据库：
*  1、用户名是否已经被注册
*/
router.post('/user/register', function (req, res, next) {

    //对数据进行验证
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    if (username == '') {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    if (password == '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    if (password != repassword) {
        responseData.code = 3;
        responseData.message = '两次密码不一致';
        res.json(responseData);
        return;
    }

    //数据库查询逻辑
    User.findOne({
        username: username
    }).then(function (userInfo) {


        if (userInfo) {
            responseData.code = 4;
            responseData.message = '用户名已经被注册';
            res.json(responseData);
            return;
        }
        //如果userinfo为空，则表示数据库没有该记录,将数据存进数据库
        var user = new User({
            username: username,
            password: password,
        });
        return user.save()
    }).then(function (newUserInfo) {

        responseData.message = '注册成功';
        res.json(responseData);
    });
});

router.post('/user/login', function (req, res) {
    console.log(req.body)
    var username = req.body.username;
    var password = req.body.password;
    if (username == '' || password == '') {
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    }

    //查询数据库中相同的用户名和密码是否存在
    User.findOne({
        username: username,
        password: password
    }).then(function (userInfo) {
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        responseData.message = '登录成功';
        //返回登陆成功的信息
        responseData.data = {
            _id: userInfo._id,
            username: username,
        }
        //服务器会接收到cookies信息
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: username,
        }));
        res.json(responseData);
    })
});

router.get('/user/logout', function (req, res) {

    req.cookies.set('userInfo', null);
    responseData.message = "退出成功";
    res.json(responseData)
});


router.get('/comment', function (req, res) {
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        responseData.data = content.comments;
        res.json(responseData)
    })
})

router.post('/comment/post', function (req, res) {
    var contentId = req.body.contentid || '';
    //一条评论的格式
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    };
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.comments.push(postData);
        return content.save()
    }).then(function (newContent) {
        responseData.message = '成功';
        responseData.data = newContent;
        res.json(responseData)
    })
});

//留言API
router.post('/leaveMsg', function (req, res) {
    console.log(req.body)
    if (!req.body.name) {
        responseData.code = 1;
        responseData.message = '请输入一个昵称';
        res.json(responseData);
        return;
    }
    if (!req.body.message) {
        responseData.code = 2;
        responseData.message = '请输入留言';
        res.json(responseData);
        return;
    }
    new Message({
        name: req.body.name,
        message: req.body.message,
        isSpecial:false
    }).save().then(function () {
        responseData.code = 0;
        responseData.message = '留言成功';
        res.json(responseData)
    })
})

//获取全部留言
router.get('/getMsg',function (req,res) {
    Message.find().sort({_id: -1}).then(function (msg) {
        if(msg){
            responseData.code = 0;
            responseData.message = '获取成功';
            responseData.data = msg;
            res.json(responseData)
        }
    })
})


//获取文章内容
router.get('/getcontent', function (req, res) {
    var contentId = req.query.id;
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        responseData.code = 0;
        responseData.message = '成功';
        responseData.data = content;
        res.json(responseData)
    }).catch(function (reason) {
        responseData.code = 100;
        responseData.message = '文章不存在';
        res.json(responseData)
    })
})




module.exports = router;