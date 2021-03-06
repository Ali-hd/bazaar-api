require('dotenv').config();
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS,
  accessKeyId: process.env.AWS_ACCESS,
  region:'me-south-1'
})
 
const s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
  console.log(file)
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true)
  } else {
    cb(new Error('Invalid Type, only JPEG and PNG'), false)
  }
}
 
const upload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: 'bazzar-photos',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
})

module.exports = upload;