const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
    title:{
        required: true,
        default: "",
        type:String,
        text: true
    },
    description:{
        required: true,
        default: "",
        type:String
    },
    location:{
        required: true,
        default: "",
        type:String
    },
    startBid:{
        required: false,
        default: '0',
        type:String
    },
    price:{
        required: false,
        default: '',
        type:String,
    },
    images:{
        required: true,
        default: [],
        type: Array
    },
    approved:{
        default: true,
        type: Boolean
    },
    open:{
        default: true,
        type: Boolean
    },
    views:{
        type: Number,
        default: 0
    },
    likes:{
        type: Number,
        default: 0
    },
    comments:[{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    user:{
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    bids:{
        default: [],
        required: false,
        type: Array
    }
},{timestamps: true})

const Post = mongoose.model('Post',postSchema)


const commentSchema = new Schema({
    description:{
        required: true,
        type: String
    },
    user:{
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    postId:{
        required: true,
        type: String
    }
},{timestamps: true})

const Comment = mongoose.model('Comment', commentSchema)


exports.Post = Post
exports.Comment = Comment