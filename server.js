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
const User = require('./models/user')
const { Conversation, Message } = require('./models/chat')

var authRout = require('./routes/auth')
var userRout = require('./routes/user')
var postRout = require('./routes/post')
var actionRout = require('./routes/action')

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
app.use('/action', actionRout)


const connect = mongoose.connect(
    process.env.DB_AUTH, {useNewUrlParser:true, useUnifiedTopology: true })
.then(console.log('MongoDB Connected!'))
.catch(err=>console.log(err))


//Socket io
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
                const info = { bid:parseInt(bid.bid), username: socket.decoded.username }
                const post = await Post.findById(bid.postId,{bids:1, user: 1})
                if(post.user == socket.decoded.id){
                    return io.emit('output',{msg:"You cant bid on your own post", _id: post._id})
                }else if(post.bids.length>0 && post.bids[0].bid >= bid.bid){
                    return io.emit('output',"You must bid more than current bid")
                }else{
                    post.bids.unshift(info)
                    post.save((err, doc)=>{
                        return io.emit('output',doc)
                    })
                }
            }catch(error){
                console.log(error)
                return io.emit('output', 'Unknown server error')
            }
        })
    })
    
    socket.on('subscribe', room=>{
        console.log('joining room', room)
        socket.join(room)
    })

    socket.on('leaveRoom', room=>{
        console.log('leaving room', room)
        socket.leave(room)
    })

    socket.on("chat", msg=>{
        connect.then(async db=>{
            try{
                const findChat = await Conversation.find( { participants: { $all: [msg.username, socket.decoded.username] } } ).populate('messages')
                if(findChat.length<1){
                    console.log('new conversation')
                    let firstmessage = {
                        sender: socket.decoded.username,
                        content: msg.content
                    }
                    let newMessage = await Message.create(firstmessage)
                    let newConversation = await Conversation.create({participants:[msg.username, socket.decoded.username]})
                    let user1 = await User.findOne({username: socket.decoded.username})
                    let user2 = await User.findOne({username: msg.username})
                    newConversation.messages.push(newMessage)
                    newConversation.save((err, doc)=>{
                        user1.conversations.unshift(newConversation)
                        user1.save()
                        user2.conversations.unshift(newConversation)
                        user2.save()
                        return socket.broadcast.to(msg.room).emit('output', doc.messages)
                    })
                }else if(findChat.length>0){
                    let newMsg = {
                        sender: socket.decoded.username,
                        content: msg.content
                    }
                    io.in(msg.room).clients( async (err, clients)=>{
                        if(clients.length<2){
                            let receiver = await User.findOne({username: msg.username})

                            if(!receiver.notifications.find(x=> x.from == socket.decoded.username)){
                                receiver.notifications.push({
                                    from: socket.decoded.username,
                                    description: msg.content,
                                })
                                receiver.save()
                            }
                        }
                    })
                    let addMsg = await Message.create(newMsg)
                    findChat[0].messages.push(addMsg)
                    findChat[0].save((err, doc)=>{
                        console.log('outputing')
                        return io.in(msg.room).emit('output', doc.messages)
                        // return io.emit('output', doc.messages)
                    })
                }else{
                    return io.emit('error sending message')
                }
            }catch(error){
                console.log(error)
                return io.emit('output', 'Unknown server error')
            }
        })
    })
})

//NOTE!: need to give herku .env vars from settings app
const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`server is running on port ${PORT}`))

module.exports = app;