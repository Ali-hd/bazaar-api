// const app = require('../server')
// const io = app.get("io")
// const connect = app.get("connect")
// const { Post } = require('../models/post')

// io.on("connection", socket =>{
//     socket.on("name", msg=>{
//         connect.then(async db=>{
//             try{
//                 console.log('socket received')
//                 let post = await Post.findById('5e9e2fa89dff42481867bbf1')
//                 post.views = post.views + 1
//                 post.save((err, doc)=>{
//                     return io.emit('output',doc)
//                 })
//             }catch(error){
//                 console.log(error)
//             }
//         })
//     })
// })