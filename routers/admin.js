var express = require('express');
var router = express.Router();
var User = require('../models/User')
var Category = require('../models/Category')

router.use(function (req, res, next) {
  if (!req.userInfo.isAdmin) {
    res.send('对不起。只有管理员才能进入。')
  }
  next()
});

router.get('/', function (req, res, next) {
  res.render('admin/index')
});

//用户列表
router.get('/user', function (req, res) {
  var page = Number(req.query.page || 1);
  var limit = 10;

  //查询总数
  User.count().then(function (count) {

    var pages = Math.ceil(count / limit);
    page = Math.min(page, pages);
    page = Math.max(page, 1);

    var skip = (page - 1) * limit;

    //从数据库中读取记录(限制)
    User.find().limit(limit).skip(skip).then(function (users) {
      //渲染模版
      res.render('admin/user_index', {
        userInfo: req.userInfo,
        users: users,
        page: page,
        count: count,
        limit: limit,
        pages: pages
      })
    })
  })

});

//分类列表
router.get('/category', function (req, res) {
  var page = Number(req.query.page || 1);
  var limit = 10;

  //查询总数
  Category.count().then(function (count) {

    var pages = Math.ceil(count / limit);
    page = Math.min(page, pages);
    page = Math.max(page, 1);

    var skip = (page - 1) * limit;

    //从数据库中读取记录(限制)
    Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories) {
      //渲染模版
      res.render('admin/category_index', {
        userInfo: req.userInfo,
        categories: categories,
        page: page,
        count: count,
        limit: limit,
        pages: pages
      })
    })
  })

});

//增加分类
router.get('/category/add', function (req, res) {
  res.render('admin/category_add', {
    userInfo: req.userInfo
  })
});

//提交新增分类
router.post('/category/add', function (req, res) {
  var name = req.body.name || '';
  if (name == "") {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: "名称不能为空"
    });
    return;
  }
  //数据库是否存在相同内容
  Category.findOne({
    name: name
  }).then(function (rs) {
    if (rs) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: "分类已经存在"
      });
      return Promise.reject();

    } else {
      //数据库不存在，可以保存
      return new Category({
        name: name
      }).save();
    }
  }).then(function (newCategory) {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '分类保存成功',
      url: '/admin/category'
    })
  })
});

//修改分类
router.get('/category/edit',function (req,res) {

  //获取要修改的分类
  var id = req.query.id || '';
  Category.findOne({
    _id:id
  }).then(function (category) {
    if(!category){
      res.render('admin/error',{
        userInfo: req.userInfo,
        message: "分类信息不存在"
      });
      //return Promise.reject();
    }else {
      //分类信息存在，修改
      res.render('admin/category_edit',{
        userInfo: req.userInfo,
        category: category
      });
    }
  })
});

//分类修改保存
router.post('/category/edit',function (req,res) {
  var id = req.query.id || '';
  var name = req.body.name || '';

  Category.findOne({
    _id:id
  }).then(function (category) {
    console.log(category)
    if(!category){
      res.render('admin/error',{
        userInfo: req.userInfo,
        message: "分类信息不存在"
      });
      return Promise.reject();
    }else {
      //用户没有做任何修改
      if(name==category.name){
        res.render('admin/success', {
          userInfo: req.userInfo,
          message: '分类修改成功',
          url: '/admin/category'
        })
        return Promise.reject()
      }else {
        //要修改的名称是否已经存在
        return Category.findOne({
          //id不等于当前id，当是名称相同
          _di:{$ne:id},
          name:name
        });
      }
    }
  }).then(function (sameCategory) {
    if (sameCategory){
      res.render('admin/error',{
        userInfo: req.userInfo,
        message: "数据库中已存在相同分类名"
      });
      return Promise.reject();
    }else {
      //保存数据
      return Category.update({
        _id:id
      },{
        name:name
      });
    }
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '分类修改成功',
      url: '/admin/category'
    });
  })
});

//分类删除
router.get('/category/delete',function (req,res) {
  //获取id，删除
  var id = req.query.id || '';
  Category.remove({
    _id:id
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/category'
    });
  })
})

module.exports = router;