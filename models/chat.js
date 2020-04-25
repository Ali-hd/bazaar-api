const mongoose = require('mongoose')
const Schema = mongoose.Schema

const conversationSchema = new Schema ({
    participants:{
        type: Array,
        default: []
    },
    messages:[{
        type:Schema.Types.ObjectId,
        ref:'Message'
    }]
},{timestamps: true})

const messagesSchema = new Schema ({
    sender:{
        type: String,
        default: ""
    },
    content:{
        type: String,
        default: ""
    },
    time:{
        type: String,
        default: new Date()
    }
})

const Conversation = mongoose.model('Conversation',conversationSchema)
const Message = mongoose.model('Message',messagesSchema)
exports.Conversation = Conversation
exports.Message = Message