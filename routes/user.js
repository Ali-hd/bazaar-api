const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { Conversation, Message } = require('../models/chat')

router.get('/:username', async (req,res)=>{
    let decoded
    //in case token is expired
    try{
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined
        decoded = token ? jwt.verify(token, process.env.JWT_SECRET) : {id:null}
    }catch(err){
        // console.log(err)
        decoded = {id:null}
    }
        
    try{
        let user
        if(decoded && decoded.username == req.params.username || decoded && decoded.admin){
            if(req.query.type == 'liked'){
                user = await User.findOne({username:req.params.username},{password:0, posts:0}).populate('liked')
            }else{
                user = await User.findOne({username:req.params.username},{password:0}).populate({path: 'posts', populate:{path:'comments', select:'_id'}}).populate({path: 'liked', select: 'title createdAt description images comments', populate:{path: 'comments', select: '_id'}})
            }
            //if user = null then "user not found"
            res.send({success: true, user})
        }else{
            user = await User.findOne({username:req.params.username},{email:0,password:0}).populate({path: 'posts', populate:{path:'comments', select:'_id'}}).populate({path: 'liked', select: 'title createdAt description images comments', populate:{path: 'comments', select: '_id'}})
            res.send({success: true, user})
        }
    }catch(err){
        console.log(err)
        res.status(500).json({success: false, msg: 'error finding user'})
    }
})


router.put('/:username', passport.authenticate('jwt', {session: false}), async (req,res)=>{

    try{
        let updateUser = {
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            description: req.body.description,
            profileImg: req.body.profileImg,
            location: req.body.location,
        }

    Object.keys(updateUser).forEach(key => updateUser[key] === undefined && delete updateUser[key])

        const user = await User.findOne({username:req.params.username})
        console.log(user._id)
        console.log(req.user._id)
        if(user.username == req.user.username){
            User.findOneAndUpdate({username:req.params.username}, updateUser, { useFindAndModify: false })
            .then(()=>res.json({success: true, msg:'user has been updated'}))
            .catch(err=>res.status(400).json({success: false, msg:'failed to update user'}))
        }else{
            res.status(401).json({success: false, msg: 'Unauthorised'})
        }
    }catch(error){
        res.status(500).json({success: false, msg: 'error updating user'})
    }
})


router.post('/:username/follow', passport.authenticate('jwt', {session: false}), async (req,res)=>{

    try{
        const user = await User.findById(req.user._id)
        const followUser = await User.findOne({username:req.params.username})

        user.following.unshift(followUser)
        user.save()
        followUser.followers.unshift(user)
        followUser.save()

        res.json({success: true, msg:'followed successfully'})
    }catch(error){
        res.status(500).json({success: false, msg: 'error following user'})
    }
})

router.post('/:username/rate', passport.authenticate('jwt', {session: false}), async (req,res)=>{
    try{
        const review = {
            star: req.body.star,
            description: req.body.description,
            username: req.user.username,
            userImg: req.user.profileImg,
            date: new Date(Date.now()).toISOString()
        }

        const record = {
            username: req.params.username,
            star: req.body.star
        }

        const reviewer = await User.findOne({username:req.user.username})
        let didReview = reviewer.rated.some( rating => rating['username'] === req.params.username )
        if(didReview){
            res.status(400).json({success: false, msg: 'You have already rated this user'})
        }else{
            const user = await User.findOne({username:req.params.username})
            reviewer.rated.push(record)
            reviewer.save()
            user.ratings.unshift(review)
            user.save()
            
            res.json({success: true, msg:'rated successfully'})
        }

    }catch(error){
        console.log(error)
        res.status(500).json({success: false, msg: 'error rating user'})
    }
})


//start new/existing conversation
router.post('/conversation', passport.authenticate('jwt', {session: false}), async (req,res)=>{

    let user1 = req.user.username
    let user2 = req.body.username

    try{
        const findChat = await Conversation.find( { participants: { $all: [user1, user2] } } )
        if(findChat.length<1){
            let firstmessage = {
                sender: user1,
                content: req.body.content
            }
            let newMessage = await Message.create(firstmessage)
            let newConversation = await Conversation.create({participants:[user1, user2]})
            let user11 = await User.findOne({username: user1})
            let user22 = await User.findOne({username: user2})
            newConversation.messages.push(newMessage)
            newConversation.save()
            user11.conversations.unshift(newConversation)
            user11.save()
            user22.conversations.unshift(newConversation)
            user22.save()
            res.send({msg:'new message sent'})
            }
        if(findChat.length>0){
            let newMsg = {
                sender: user1,
                content: req.body.content
            }
            let addMsg = await Message.create(newMsg)
            findChat[0].messages.push(addMsg)
            findChat[0].save()
            res.send({msg:'messsage sent'})
        }
    }catch(error){
        console.log(error)
        res.status(500).json({success: false, msg: 'error rating user'})
    }
})


module.exports = router