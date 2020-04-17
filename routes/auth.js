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
                message: info ? info.message : 'Login failed',
                user   : user
            });
        }

        req.login(user,{session:false},(err)=>{
            if(err){
                res.send(err)
            }
            //token info
            let userData = { id:user._id , isadmin : user.isadmin, username:user.username }
            const token = jwt.sign(userData,'secret',{expiresIn: 60 * 60});

            return res.json({token});
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
    userName : req.body.username,
    city : req.body.city,
    isadmin: false,
    }

    User.findOne({email:req.body.email})
    .then(user=>{
        if(!user){
            bcrypt.hash(req.body.password , 10 ,(err, hash)=>{
                newUser.password = hash
                User.create(newUser)
                //user created 
                .then(user => res.json({msg: 'created successfully',userInf:newUser}))
                .catch(err =>res.send(err))
            })
        }else{ res.json({msg:'email already used'})}
    }).catch(err=>res.send(err))
})

module.exports = router