const mongoose = require('mongoose')
const Schema = mongoose.Schema

const viewsSchema = new Schema({
    postId:{
        default:'',
        required: true,
        unique: true,
        type: String
    },
    ipPool:[{ 
        ip:String,
        visits: Number
    },{timestamps: true}]
})

const Views = mongoose.model('Views',viewsSchema)
module.exports = Views