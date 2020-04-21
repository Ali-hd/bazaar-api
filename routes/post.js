const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const Views = require('../models/views')
const { Post, Comment } = require('../models/post')
const User = require('../models/user')

const upload = require('../services/imgUpload')
const singleUpload = upload.single('image')

router.post('/upload', function(req,res){
    singleUpload(req,res, function(err){
        if(err){
            res.status(422).send({error:err.message})
        }else{
            return res.json({'imageUrl':req.file.location});
        }
    });  
});

//using passport .authenticate function will check bearer token if its valid or not. req wont go through if its not.
router.get('/', passport.authenticate('jwt', {session: false}), async function(req,res){
    axios.get('http://api.ipify.org/?format=json').then(result=>{
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
        }
        console.log(ip)
        let visit = { ip: result.data.ip}
        Views.findOneAndUpdate({postId:req.body.id},{$push:{ipPool:visit}},{ useFindAndModify: false })
        .then(post=>{
            if(!post){
                Views.create({ postId: req.body.id }).catch(err =>console.log(err)) 
            }
        }).catch(err=>console.log(err))
        res.status(200).json('success')
    }).catch(err=>console.log(err))

    try{

    }catch(error){
        console.log(error)
    }
})

router.post('/create', passport.authenticate('jwt', {session: false}),( async (req,res) =>{
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id
    
    const newPost = {
        title:req.body.title,
        description: req.body.description,
        location: req.body.location,
        images: req.body.images,
        user: userId
    }

    try{
        let post = await Post.create(newPost)
        let user = await User.findById(userId)
        user.posts.push(post)
        user.save()
        res.json({msg:'post created successfully'})
    }catch(err){
        console.log(err)
        res.status(400).json({msg:'error creating post'})
    }
        
})
)

router.get('/:id',async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id)
        res.send({success: true , post})
    }catch{
        res.status(400).json({msg:'error getting post'})
    }
})

router.post('/:id/comment', passport.authenticate('jwt', {session: false}), async(req,res)=>{
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const newComment = {
        description: req.body.description,
        username: 'Alihd',
        userId: decoded.id,
        postId: req.params.id
    }

    try{
        let comment = await Comment.create(newComment)
        let post = await Post.findById(req.params.id)
        post.comments.push(comment)
        post.save()
        res.send({success: true, msg: 'comment created successfully'})
    }catch(error){
        console.error(error);
        res.status(400).json({msg:'error posting comment'})
    }

})

router.put("/:id", passport.authenticate('jwt', {session: false}), async (req,res)=>{
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    let updateP = {
        title: req.body.title,
        description: req.body.description
    }

    Object.keys(updateP).forEach(key => updateP[key] === undefined && delete updateP[key])
    
    try{
        const post = await Post.findById(req.params.id)
        console.log(post,decoded, updateP)
        if(post.user == decoded.id){
            Post.findByIdAndUpdate(req.params.id,updateP, {useFindAndModify: false})
            .then(()=>res.json({success: true, msg:'post has been updated'}))
            .catch(err=>res.status(400).json({success: false, msg:'failed to update post'}))
        }else{
            res.status(401).json({success: false, msg: 'you cant update this post'})
        }
    }catch{
        res.status(500).json({success: false, msg: 'error updating post'})
    }
})


router.post('/:id/watchlater', passport.authenticate('jwt', {session: false}), async (req,res)=>{
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    try{
        const user = await User.findById(decoded.id)
        const post = await Post.findById(req.params.id)
        user.watchlater.push(post)
        user.save()
        res.json({success: true, msg:'post has been added to watchlater'})
    }catch(error){
        res.status(500).json({success: false, msg: 'error adding post'})
    }
})


router.post('/:id/close', passport.authenticate('jwt', {session: false}), async (req,res)=>{
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    try{
        const post = await Post.findById(req.params.id)
        if(decoded.id == post.user){
            post.open = false
            post.save()
            res.json({success: true, msg:'post has been closed'})
        }else{
            res.status(401).json({success: false, msg: 'unauthorised'})
        }
    
    }catch(error){
        res.status(500).json({success: false, msg: 'error closing post'})
    }
})



module.exports = router;