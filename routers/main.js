var express = require('express');
var router = express.Router();
var Category = require('../models/Category')

router.get('/', function (req, res, next) {
  console.log(req.userInfo)
  Category.find().then(function (categories) {
    res.render('main/index', {
      userInfo: req.userInfo,
      categories:categories
    });
  })



});

module.exports = router;