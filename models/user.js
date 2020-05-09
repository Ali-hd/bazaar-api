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
        default: "https://i.imgur.com/iV7Sdgm.jpg",
        required: false , 
        type: String
    },
    phoneNumber:{
        required: false , 
        type: String,
        unique:true
    },
    location:{
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
    liked:[{ 
        type:Schema.Types.ObjectId,
        ref:'Post'
    }],
    conversations:[{
        type:Schema.Types.ObjectId,
        ref:'Conversation'
    }],
    ratings:{
        required: false,
        default: [],
        type: Array
    },
    rated:{
        required: false,
        default: [],
        type: Array
    },
    notifications:{
        required: false,
        default: [],
        type: Array
    }

},{timestamps: true},)

const User = mongoose.model('User',userSchema)
module.exports = User