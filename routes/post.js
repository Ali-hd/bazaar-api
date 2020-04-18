const express = require('express')
const router = express.Router()
const axios = require('axios')
const Views = require('../models/views')

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

router.get('/', function(req,res){
    axios.get('http://api.ipify.org/?format=json').then(result=>{
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
        }
        console.log(ip)
        let visit = { ip: result.data.ip}
        // Views.findOneAndUpdate({postId:req.body.id},{$push:{ipPool:visit}},{ useFindAndModify: false })
        // .then(post=>{
        //     if(!post){
        //         Views.create({ postId: req.body.id }).catch(err =>console.log(err)) 
        //     }
        // }).catch(err=>console.log(err))
        res.status(200).json('success')
    }).catch(err=>console.log(err))
})


module.exports = router;