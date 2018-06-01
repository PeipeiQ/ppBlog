var express = require('express');
var router = express.Router();
var User = require('../models/User');

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
    console.log(req.body);
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
        console.log(userInfo)

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
        console.log(newUserInfo)
        responseData.message = '注册成功';
        res.json(responseData);
    });
});

router.post('/user/login', function (req, res) {
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
    console.log(req.query)
    req.cookies.set('userInfo', null);
    responseData.message = "退出成功";
    res.json(responseData)
});


module.exports = router;