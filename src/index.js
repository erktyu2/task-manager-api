const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT


// const multer = require('multer')
// const upload = multer({
//     dest: 'images',
//     limits:{
//         fileSize: 1000000
//     },fileFilter(req,file,cb){
//         // if(!file.originalname.endsWith('.pdf')){
//         //     return cb(new Error('Please upload a PDF'))
//         // }

//         if(!file.originalname.match(/\.(doc|docx)$/)){ //regular expression is writen between two of / 
//                                                        //  this \  means start with the following \. start with .   or \na start with "na"
//                                                        //  $ means nothing can be added to match afterwards
//                                                        // | means or 
//                                                        // (opt1 | opt2) one of the conditions is accepted
//             return cb(new Error('Please upload a Word Document'))
//         }

//         // cb(new Error('File must be a PDF'))
//         cb(undefined,true)
//         // cb(undefined,false) // this is for to block upload
//     }
// })

// app.post('/upload', upload.single('uploadaa'),(req,res)=>{
//     res.send()
// },(error,req,res,next)=>{
//     res.status(400).send({error : error.message})
// })


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

// const Task = require('./models/task')

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async ()=>{
//     // const task = await Task.findById('5c881805d7ab363cb2b54abd')
//     // await task.populate('owner').execPopulate();
//     // console.log(task.owner)
    

//     const user = await User.findById('5c8816774dcefe3927a5c7a4')
//     await user.populate('userTasks').execPopulate()
//     console.log(user.userTasks)

// }

// main()