const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!');
            }
        }
    },age:{
        type: Number,
        default: 0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number');
            }
        }
    },password:{
        type:String,
        required:true,
        minlength:6,
        trim: true,
        validate(value){
            var array=['password','123456','1234567890','1111111'];

            for(var i=0;i<array.length;i++){
                if(value.toLowerCase().includes(array[i])){
                    throw new Error('Too weak password');
                }
            }
        }
    },tokens:[{
        token:{
            type: String,
            required: true 
        }        
    }],avatar:{
        type: Buffer
    }
}, {
    timestamps:true
})

// schema.virtual create an temporarly connection between given two models 
userSchema.virtual('userTasks',{
    ref: 'Task', //reference to the model that is associated
    localField: '_id', //local property that is used in the other model
    foreignField: 'owner' // the name of the foreign field
})

// alt 1:
// userSchema.methods.getPublicProfile = function (){
//     const user = this

//     const userObject = user.toObject()

//     delete userObject.password
//     delete userObject.tokens

//     return userObject
// }


//alt2: 
userSchema.methods.toJSON = function (){ 
    // toJSON is a special method that all js objects have access to
    // once a function assigned to object.toJSON, it is executed just before converting into json object
    // and whatever is returning in the end will be send as json object value
    const user = this

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
} 


userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({ _id : user._id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token });
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}

//Hash the plain text password before saving 
userSchema.pre('save', async function (next){
    const user = this

    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8 )
    }
    
    next()
})

userSchema.pre('remove', async function (next) {
    const user = this

    await Task.deleteMany({owner: user._id})

    next();
})

const User = mongoose.model('User',userSchema) //###UserIsTakenFromHere### the one in ('User',userSchema)
  
module.exports = User;