require('dotenv').config();
const express = require("express")
const app = express()
const server = require('http').createServer(app)
const io = require("socket.io")(server)
const mongoose = require("mongoose")
const cors = require('cors')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const methodOverride = require('method-override') 
require('./passport');
const { Post } = require('./models/post')

var authRout = require('./routes/auth')
var userRout = require('./routes/user')
var postRout = require('./routes/post')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('trust proxy', true)
app.use(cors())
app.use(passport.initialize())

mongoose.set('useCreateIndex', true)
app.use(methodOverride('_method'))

app.get('/',async(req, res) =>{
    res.json("bazaar api")
   });

app.use('/auth',authRout)
app.use('/post',postRout)
app.use('/user', userRout)


const connect = mongoose.connect(
    process.env.DB_AUTH, {useNewUrlParser:true, useUnifiedTopology: true })
.then(console.log('MongoDB Connected!'))
.catch(err=>console.log(err))

io.use(function(socket, next){
    if (socket.handshake.query && socket.handshake.query.token){
        jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, function(err, decoded) {
          if(err) return next(new Error('Authentication error'));
          socket.decoded = decoded;
          next();
        });
      } else {
          next(new Error('Authentication error'));
      } 
})
io.on("connection", socket =>{
    socket.on("bids", bid=>{
        connect.then(async db=>{
            try{
                console.log('socket received')
                console.log(bid)
                let post = await Post.findById(bid.postId)
                post.views = post.views + 1
                post.save((err, doc)=>{
                    return io.emit('output',doc)
                })
            }catch(error){
                console.log(error)
            }
        })
    })
    // socket.on("name", msg=>{
    //     connect.then(async db=>{
    //         try{
    //             console.log('socket received')
    //             console.log(msg)
    //             return io.emit('output','we got it')
    //         }catch(error){
    //             console.log(error)
    //         }
    //     })
    // })
})

//NOTE!: need to give herku .env vars from settings app
const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`server is running on port ${PORT}`))

module.exports = app;