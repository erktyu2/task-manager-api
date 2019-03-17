const mongoose = require('mongoose');
const validator = require('validator');


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify:false
})

// const Task = mongoose.model('Task', {
//     description: {
//         type: String,
//         trim: true,
//         required:true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     }
// })

// const task = new Task({
//     description: 'Learn the Mongoose library                           ',
// })

// task.save().then(() => {
//     console.log(task)
// }).catch((error) => {
//     console.log(error)
// })