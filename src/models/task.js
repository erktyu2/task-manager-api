const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User' 
        //this User is taken from user model file, go to user model file press 
        // ctrl + f and search for ###UserIsTakenFromHere###
    }
},{
    timestamps:true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task