const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

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
                user = await User.findOne({username:req.params.username},{password:0}).populate('posts')
            }
            //if user = null then "user not found"
            res.send({success: true, user})
        }else{
            user = await User.findOne({username:req.params.username},{email:0,password:0,liked:0}).populate('posts')
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
            userImg: req.user.profileImg
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
            user.ratings.unshift(review)
            user.save()
            reviewer.save()
    
            res.json({success: true, msg:'rated successfully'})
        }

    }catch(error){
        console.log(error)
        res.status(500).json({success: false, msg: 'error rating user'})
    }
})



module.exports = router