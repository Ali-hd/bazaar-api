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
        let user = await User.findOne({username:req.params.username}).populate('posts')
        //if user = null then "user not found"
        user = user.toJSON()
        if(decoded && decoded.id == req.params.username || decoded && decoded.admin){
            res.send({success: true, user})
        }else{
            //response feels slow 
            Object.keys(user).forEach(key => {
                if(['email', 'password', 'purchesedorder', 'watchlater'].includes(key))
                delete user[key]
            })
            res.send({success: true, user})
        }
    }catch(err){
        console.log(err)
        res.status(500).json({success: false, msg: 'error finding user'})
    }
})


router.put('/:username', passport.authenticate('jwt', {session: false}), async (req,res)=>{
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

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
        if(user._id == decoded.id){
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
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    try{
        const user = await User.findById(decoded.id)
        const followUser = await User.findOne({username:req.params.username})

        user.following.push(followUser)
        user.save()
        followUser.followers.push(user)
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
            description: req.body.description
        }

        const user = await User.findOne({username:req.params.username})
        user.ratings.push(review)
        user.save()

        res.json({success: true, msg:'rated successfully'})
        
    }catch(error){
        res.status(500).json({success: false, msg: 'error rating user'})
    }
})



module.exports = router