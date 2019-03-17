const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const sharp = require('sharp')
const User = require('../models/user')
const {sendWelcomeEmail,sendCancelationEmail} = require('../emails/account')
const multer = require('multer')
// const Task = require('../models/task')
// 

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try{
        await user.save();
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()

        res.status(201).send({user,token});
    }catch(e){
        res.status(400).send(e)    
    } 
})

router.post('/users/login',async (req,res)=>{

    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        //alt 1: res.send({user: user.getPublicProfile(), token});
        res.send({ user , token});
    }catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout', auth , async (req,res)=>{
    // req.user
    // const token = req.header('Authorization').replace('Bearer ','')
    // const updatedUser = await User.findOneAndUpdate({ _id : req.user._id},{'tokens[token':'pattiskoftis'})
    // res.redirect('/');

    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token // at token.token, first token is the each object and second token is the object property
        }) // this means leave only the ones that is not equal to the given token
        await req.user.save();

        res.send()
    }catch(e){
        res.status(500).send()
    }
})  

router.post('/users/logoutAll', auth , async (req,res)=>{
    try{
        req.user.tokens = [];
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/users/me' , auth , async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me',auth ,async (req,res)=>{

    const updates = Object.keys(req.body)
    const validUpdates = ['name','email','age','password']

    const isValid = updates.every(update=> validUpdates.includes(update))
        /* 'every' is a method that takes all returns and connect them with and operator what i mean with that
    if there is 4 objects 'every' returns like this for boolean cases ========> 
    return(returnValue1 && returnValue2 && returnValue3 && returnValue4)
    which means every returns true only when every result return to true */

    if(!isValid){
        return res.status(400).send('Includes invalid update')
    }
    
    try{
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })

        await req.user.save()

        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
    


    // const updates = Object.keys(req.body)
    // const allowedUpdates = ['name','email','password','age']

    // const isValidOperation = updates.every((update)=>{
    //     return allowedUpdates.includes(update)
    // }); 
    


    // if(!isValidOperation){
    //     return res.status(400).send({'error': 'invalid updates!'});
    // }

    // try{
    //     const user = await User.findById(req.params.id)

    //     updates.forEach((update)=>{
    //         user[update] = req.body[update]
    //     })

    //     // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    //     if(!user){
    //         return res.status(404).send()
    //     }

    //     await user.save()

    //     res.send(user)
    // }catch(e){
    //     res.status(400).send(e)
    // }
})

router.delete('/users/me',auth, async (req,res)=>{
    try{
        // alt 1 to remove tasks that contains to user 
        // await Task.deleteMany({owner:req.user._id})
        // there is need to import Task module

        // alt 2 to remove tasks that contains to user
        // fir alt 2 no need for additional code because it is already added into remove middleware
        await req.user.remove()
        sendCancelationEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

const avatar = multer({
    // dest: 'avatars',
    limits:{
        fileSize:1000000
    },fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image file'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth, avatar.single('avatarOfMe'),async (req,res)=>{
    // req.file this object comes from multer and carry all info that uploaded file has
    // this is the reason why we need to run multer function as middleware before this function

    const buffer = await sharp(req.file.buffer).resize({width: 250 , height:250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error : error.message})
})

router.delete('/users/me/avatar', auth , async (req,res)=>{
    // await User.findOneAndUpdate({_id:req.user._id},{avatar:undefined}) this is how to clean inside the avatar field
    req.user.avatar = undefined // this is how to remove avatar property from the database
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async(req,res)=>{
    try{
         const user = await User.findById(req.params.id)
         if(!user.avatar || !user){
            throw new Error()
         }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }

})

module.exports = router;