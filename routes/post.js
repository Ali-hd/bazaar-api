const express = require('express')
const router = express.Router()

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


module.exports = router;