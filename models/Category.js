
var mongoose = require('mongoose');

var categoriesSchema = require('../schemas/categoty');

module.exports=mongoose.model('Category',categoriesSchema);
