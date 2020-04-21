require('dotenv').config();
const express = require("express");
const server = express();
const mongoose = require("mongoose");
const cors = require('cors');
const passport = require('passport');
const methodOverride = require('method-override') 
require('./passport');

var authRout = require('./routes/auth')
var userRout = require('./routes/user')
var postRout = require('./routes/post')

server.use(express.json())
server.use(express.urlencoded({ extended: false }))

server.get('/',async(req, res, next) =>{
    res.send("hello")
   });

server.use(cors())
server.use(passport.initialize())

mongoose.set('useCreateIndex', true)
server.use(methodOverride('_method'))

server.use('/auth',authRout)
server.use('/post',postRout)
server.use('/user', userRout)

mongoose.connect(
    process.env.DB_AUTH, {useNewUrlParser:true, useUnifiedTopology: true })
.then(console.log('MongoDB Connected!'))
.catch(err=>console.log(err));

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`server is running on port ${PORT}`))

module.exports = server;