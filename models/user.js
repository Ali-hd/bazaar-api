const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema = new Schema({
    username:{
        default: "",
        required: true,
        unique: true,
        type: String
    },
    firstName:{
        default: "",
        required: false,
        type: String
    },
    lastName:{
        default: "",
        required: false,
        type: String
    },
    email:{
        required: true,
        type: String,
        unique: true
    },
    password:{
        required: true,
        type: String,
    },
    description:{
        default: "",
        required: false , 
        type: String
    },
    profileImg:{
        default: "",
        required: false , 
        type: String
    },
    phoneNumber:{
        required: false , 
        type: String,
        unique:true
    },
    city:{
        default: "",
        required: false , 
        type: String
    },
    admin:{
        default: false,
        type: Boolean
    },
    following:[{ 
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    followers:[{ 
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    posts:[{ 
        type:Schema.Types.ObjectId,
        ref:'Post'
    }],
    comments:[{ 
        type:Schema.Types.ObjectId,
        ref:'Comment'
    }],
    watchlater:[{ 
        type:Schema.Types.ObjectId,
        ref:'Post'
    }],
    ratings:[{
        star: String,
        description: String
    }]

},{timestamps: true},)

const User = mongoose.model('User',userSchema)
module.exports = User