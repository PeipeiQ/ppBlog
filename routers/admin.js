var express = require('express');

var router = express.Router();


router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        res.send('对不起。只有管理员才能进入。')
    }
    next()
});

router.get('/', function (req, res, next) {
    res.render('admin/index')
});

module.exports = router;