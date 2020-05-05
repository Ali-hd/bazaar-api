const express = require('express')
const router = express.Router()
const passport = require('passport')
const { Conversation, Message } = require('../models/chat')
const { Post, Comment } = require('../models/post')
const User = require('../models/user')

//get user conversations
router.get('/conversations', passport.authenticate('jwt', {session: false}), async (req,res)=>{
    try{
        
        const conversations = await User.findOne({username: req.user.username},{conversations: 1, _id: 0}).sort({updatedAt:1}).populate({path:'conversations', select:'participants updatedAt', populate:{path:'messages', select:'content sender'}})
        res.send({conversations})

    }catch(error){
        console.log(error)
        res.status(500).json({success: false, msg: 'error getting conversations'})
    }
})

//get single conversation
router.get('/conversation', passport.authenticate('jwt', {session: false}), async (req,res)=>{
    try{
        const conversation =  await Conversation.findById(req.query.id).populate('messages')
        if(conversation.participants.includes(req.user.username)){
            res.send({conversation})
        }else{
            res.status(401).send({msg: 'Unauthorized access'})
        }

    }catch(error){
        console.log(error)
        res.status(500).json({success: false, msg: 'error getting conversations'})
    }
})


module.exports = router