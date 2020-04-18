require('dotenv').config();
const express = require("express");
const server = express();
const mongoose = require("mongoose");
const cors = require('cors');
const passport = require('passport');
const methodOverride = require('method-override') 
require('./passport');
const serverless = require('serverless-http')

var authRout = require('./routes/auth')
var userRout = require('./routes/user')
var postRout = require('./routes/post')

server.use(express.json())
server.use(express.urlencoded({ extended: false }))

server.use(cors())
server.use(passport.initialize())

server.use('/.netlify/functions/server/auth',authRout)
server.use('/.netlify/functions/server/post',postRout)
// server.use('/user', userRout)

server.use(methodOverride('_method'))

mongoose.set('useCreateIndex', true);
mongoose.connect(
    process.env.DB_AUTH, {useNewUrlParser:true, useUnifiedTopology: true })
.then(console.log('MongoDB Connected!'))
.catch(err=>console.log(err));

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`server is running on port ${PORT}`))

module.exports.handler = serverless(server);