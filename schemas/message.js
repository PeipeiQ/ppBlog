var mongoose = require('mongoose')

module.exports = new mongoose.Schema({
    name: String,
    message: String,
    isSpecial:{
        type:Boolean,
        default:false
    }
})