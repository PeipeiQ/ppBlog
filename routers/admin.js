var express = require('express');
var router = express.Router();
var User = require('../models/User')
var Category = require('../models/Category')
var Content = require('../models/Contents')

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
    Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function (categories) {
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
router.get('/category/edit', function (req, res) {

  //获取要修改的分类
  var id = req.query.id || '';
  Category.findOne({
    _id: id
  }).then(function (category) {
    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: "分类信息不存在"
      });
      //return Promise.reject();
    } else {
      //分类信息存在，修改
      res.render('admin/category_edit', {
        userInfo: req.userInfo,
        category: category
      });
    }
  })
});

//分类修改保存
router.post('/category/edit', function (req, res) {
  var id = req.query.id || '';
  var name = req.body.name || '';

  Category.findOne({
    _id: id
  }).then(function (category) {

    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: "分类信息不存在"
      });
      return Promise.reject();
    } else {
      //用户没有做任何修改
      if (name == category.name) {
        res.render('admin/success', {
          userInfo: req.userInfo,
          message: '分类修改成功',
          url: '/admin/category'
        })
        return Promise.reject()
      } else {
        //要修改的名称是否已经存在
        return Category.findOne({
          //id不等于当前id，当是名称相同
          _di: {$ne: id},
          name: name
        });
      }
    }
  }).then(function (sameCategory) {
    if (sameCategory) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: "数据库中已存在相同分类名"
      });
      return Promise.reject();
    } else {
      //保存数据
      return Category.update({
        _id: id
      }, {
        name: name
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
router.get('/category/delete', function (req, res) {
  //获取id，删除
  var id = req.query.id || '';
  Category.remove({
    _id: id
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/category'
    });
  })
});

//内容首页
router.get('/content', function (req, res) {


  var page = Number(req.query.page || 1);
  var limit = 10;

  //查询总数
  Content.count().then(function (count) {

    var pages = Math.ceil(count / limit);
    page = Math.min(page, pages);
    page = Math.max(page, 1);

    var skip = (page - 1) * limit;

    //从数据库中读取记录(限制)
    Content.find().limit(limit).skip(skip).populate(['category', 'user']).then(function (contents) {
      //渲染模版
      res.render('admin/content_index', {
        userInfo: req.userInfo,
        contents: contents,
        page: page,
        count: count,
        limit: limit,
        pages: pages
      })
    })
  })


});

router.get('/content/add', function (req, res) {

  //读取分类信息
  Category.find().sort({_id: -1}).then(function (categories) {
    res.render('admin/content_add', {
      userInfo: req.userInfo,
      categories: categories
    });
  });
});

router.post('/content/add', function (req, res) {
  if (req.body.category == '') {
    var response = {
      userInfo: req.userInfo,
      message: '内容分类不能为空',
      code:1
    }
    res.json(response)
    return;
  }
  if (req.body.title == '') {
    var response = {
      userInfo: req.userInfo,
      message: '标题不能为空',
      code:1
    }
    res.json(response)
    return;
  }
  //保存数据到数据库
  new Content({
    category: req.body.category,
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    user: req.userInfo._id.toString()
  }).save().then(function (rs) {
    // res.render('admin/success', {
    //   userInfo: req.userInfo,
    //   message: '内容保存成功',
    //   url: '/admin/content'
    // })
    var response = {
      userInfo: req.userInfo,
      message: '内容保存成功',
      code:0
    }
    res.json(response)
  })
});

router.get('/content/edit', function (req, res) {
  var id = req.query.id || '';
  var categories = [];

  //读取分类信息
  Category.find().sort({_id: 1}).then(function (rs) {
    categories = rs;
    return Content.findOne({
      _id: id
    }).populate('category')
  }).then(function (content) {
    if (!content) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '内容不存在'
      })
      return;
    } else {
      res.render('admin/content_edit', {
        userInfo: req.userInfo,
        categories: categories,
        content: content
      })
    }
  })
});

//保存修改
router.post('/content/edit', function (req, res) {
  var id = req.query.id || '';
  if (req.body.category == '') {
    var response = {
      userInfo: req.userInfo,
      message: '内容分类不能为空',
      code:1
    }
    res.json(response)
    return;
  }
  if (req.body.title == '') {
    var response = {
      userInfo: req.userInfo,
      message: '标题不能为空',
      code:1
    }
    res.json(response)
    return;
  }

  Content.update({
    _id: id
  }, {
    category: req.body.category,
    title: req.body.title,
    description: req.body.description,
    content: req.body.content
  }).then(function () {
    // res.render('admin/success', {
    //   userInfo: req.userInfo,
    //   message: '内容保存成功',
    //   url: '/admin/content'
    // })
    var response = {
      userInfo: req.userInfo,
      message: '内容保存成功',
      code:0
    }
    res.json(response)
  })
});

//内容删除
router.get('/content/delete', function (req, res) {
  //获取id，删除
  var id = req.query.id || '';
  Content.remove({
    _id: id
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/content'
    });
  })
})

module.exports = router;