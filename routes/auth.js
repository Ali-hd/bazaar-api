const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const passport = require('passport')
const bcrypt = require('bcrypt');
const User = require('../models/user')

router.post('/login', function(req,res,next){
    passport.authenticate('local',{session:false},(err,user,info)=>{
        if (err || !user) {
            return res.status(400).json({
                msg: info ? info.message : 'Login failed',
                user   : user
            });
        }

        req.login(user,{session:false},(err)=>{
            if(err){
                res.send(err)
            }
            
            let userData = { id:user._id , admin : user.admin, username:user.username }
            const token = jwt.sign(userData,process.env.JWT_SECRET,{expiresIn: 60 * 60 * 24});

            return res.json({token, user});
        });
    })(req, res);
})

router.post('/register', function(req,res,next){

    const newUser = {
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email : req.body.email,
    password : req.body.password,
    description : req.body.description,
    profileImg : req.body.profileimg ,
    phoneNumber : req.body.phonenumber,
    username : req.body.username,
    location : req.body.location,
    admin: false,
    }

    Object.keys(newUser).forEach(key => newUser[key] === undefined && delete newUser[key])

    User.findOne({email:req.body.email})
    .then(user=>{
        if(!user){
            bcrypt.hash(req.body.password , 10 ,(err, hash)=>{
                newUser.password = hash
                User.create(newUser)
                .then(() => res.json({msg: 'created successfully'}))
                .catch(err =>res.send(err))
            })
        }else{ res.json({msg:'email already used'})}
    }).catch(err=>res.send(err))
})


router.post('/:username', passport.authenticate('jwt', {session: false}), async function(req,res){

    if(req.body.type == 'change password' && req.params.username == req.user.username){
        try{
            let user = await User.findOne({username:req.params.username})
            const password = req.body.password
            const newPassword = req.body.newPassword
            const hash = user.password
            bcrypt.compare(password, hash, function(err, isMatch) {
                if (err) {
                  throw err
                } else if (!isMatch) {
                    res.status(500).json({success:false, msg: 'entered password incorrect'})
                } else {
                    const saltRounds = 10          
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                    if (err) {
                        throw err
                    } else {
                        bcrypt.hash(newPassword, salt, function(err, hash) {
                        if (err) {
                            throw err
                        } else {
                            user.password = hash
                            user.save()
                            res.json({success:true, msg: 'password changed'})
                            }
                        })
                    }
                })
              }
            })
        }catch{
            res.status(500).json({msg:'error'})
        }
        
    }else{
        res.status(404).json({msg:'not found'})
    }
})

router.post('/:username/check', async (req,res)=>{
    try{
        const user = await User.find({username: req.params.username})
        if(user.length>0){ res.send({msg:'username already exist'})
        }else if(!user || user.length<1){ res.send({msg:'username available'}) }
    }catch(error){
        res.status(500).json({success: false, msg: 'error finding username'})
    }
})

module.exports = router