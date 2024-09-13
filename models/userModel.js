const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    name: {
        type: String,  
        required: true  
    },
    email: {
        type: String,  
        required: true,  
        unique: true,  
        lowercase: true  
    },
    password: {
        type: String,  
        required: true,  
        minlength: 8 
    },
    country: {
        type: String,  
        required: true  
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
    activation: {
        type: Boolean,  
        default: true  
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userModel);
