const mongoose = require("mongoose")
const {createHmac,randomBytes} = require("node:crypto")
const {createTokenForUser} = require("../services/authentication")
const secret = "shrey2004";
const Schema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    profileImage:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER"
    },
    likeBlogId:[{
        type:mongoose.Schema.Types.ObjectId,
        isliked:Boolean,
        ref:"blog",
        default:null,
        required:false
    }],
    blogs:[{
        likeBlogId:{
            type:mongoose.Schema.Types.ObjectId,
        },
        type:mongoose.Schema.Types.ObjectId,
        ref:"blog"
    }],

},{timestamps:true});

Schema.pre('save',function(next){
    const user = this;
    if(!user.isModified("password")) return ;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256',salt)
    .update(user.password)
    .digest('hex')

    this.salt = salt
    this.password = hashedPassword;
    next()
})
Schema.static('matchPasswordAndGenerateToken',async function(email,password){
    const user =await this.findOne({email})
    if(!user) throw new Error("User not found");

    const salt = user.salt;
    const hashedPassword = user.password

    const userhashedPassword = createHmac('sha256',salt)
    .update(password)
    .digest('hex')
    if(hashedPassword !== userhashedPassword){
        throw new Error("incorrect password");
    }
    const token = createTokenForUser(user);
    return token
})

const User = new mongoose.model("user",Schema)

module.exports = User