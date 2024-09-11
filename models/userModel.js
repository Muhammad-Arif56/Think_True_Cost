const mongoose = require('mongoose');
const userModel = mongoose.Schema({
    
    name:{
        type: 'string',
        required: 'true',
       
    },

    email:{
        type: 'string',
        required: 'true',
        unique: 'true',
        lowercase:'true'
    },

    password:{
        type: 'string',
        required: 'true',
        minlength:8
    },
    country:{
        type:'string',
        required: 'true'

    }, 
    profileImage: {
        type: String,
        default: ""
      },

    role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
    },
    activation:{
        type: Boolean,
        default: true
    }
}, {timestamps: true})

module.exports = mongoose.model('User', userModel);