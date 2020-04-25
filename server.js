require('dotenv').config();
const express = require("express")
const app = express()
const server = require('http').createServer(app)
const io = require("socket.io")(server)
const mongoose = require("mongoose")
const cors = require('cors')
const passport = require('passport')
const methodOverride = require('method-override') 
require('./passport');
const { Post } = require('./models/post')

var authRout = require('./routes/auth')
var userRout = require('./routes/user')
var postRout = require('./routes/post')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/',async(req, res, next) =>{
    res.send("hello")
   });

app.use(cors())
app.use(passport.initialize())

mongoose.set('useCreateIndex', true)
app.use(methodOverride('_method'))

app.use('/auth',authRout)
app.use('/post',postRout)
app.use('/user', userRout)

const connect = mongoose.connect(
    process.env.DB_AUTH, {useNewUrlParser:true, useUnifiedTopology: true })
.then(console.log('MongoDB Connected!'))
.catch(err=>console.log(err))

io.on("connection", socket =>{
    socket.on("name", msg=>{
        connect.then(async db=>{
            try{
                console.log('socket received')
                console.log(msg)
                let post = await Post.findById('5e9e2fa89dff42481867bbf1')
                post.views = post.views + 1
                post.save((err, doc)=>{
                    return io.emit('output',doc)
                })
            }catch(error){
                console.log(error)
            }
        })
    })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`server is running on port ${PORT}`))

module.exports = app;