const { default: mongoose, Schema,model } = require("mongoose");

const commentSchema = new mongoose.Schema({
    content:{
        type : String,
        required : true
    },
    blogId:{
        type : Schema.Types.ObjectId,
        ref : "blogs"
    },
    createdBy:{
        type : Schema.Types.ObjectId,
        ref : "user"
    }
},{timestamps:true})

const comment = model("comment",commentSchema)
module.exports = comment