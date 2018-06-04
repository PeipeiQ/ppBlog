var mongoose = require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({
    //关联字段
    category:{
      //类型
      type:mongoose.Schema.Types.ObjectId,
      ref:'Category'
    },
    title: String,
    description:{
        type:String,
        default:''
    },
    content:{
        type:String,
        default:''
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    addTime:{
        type:Date,
        default:new Date()
    },
    views:{
        type:Number,
        default:0
    }

});