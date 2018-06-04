var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Contents');

var data;

//通用数据
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        categories: []
    };
    Category.find().then(function (categories) {
        data.categories = categories;
        next()
    })
})

router.get('/', function (req, res, next) {

    data.page = Number(req.query.page || 1);
    data.limit = 3;
    data.pages = 0;
    data.category = req.query.category || '';
    data.count = 0;

    var where = {};
    if (data.category) {
        where.category = data.category;
    }

    Content.where(where).count().then(function (count) {
        //读取总条数
        data.count = count;
        data.pages = Math.ceil(data.count / data.limit);
        data.page = Math.min(data.page, data.pages);
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1) * data.limit;

        return Content.where(where).find().limit(data.limit).sort({addTime: -1}).skip(skip).populate(['category', 'user']);
    }).then(function (contents) {
        data.contents = contents;
        res.render('main/index', data);
        //res.json(data);
    })
});

router.get('/view', function (req, res) {
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        data.content = content;

        //记录阅读数并保存到数据库
        content.views++;
        content.save();

        res.render('main/view',data);
    })
})


module.exports = router;