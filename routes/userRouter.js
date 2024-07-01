const express = require('express');
const { userSignUp, userLogin , forgotPassword,VerifyOTP, resetPassword } = require('../controllers/userController');
const userRouter = express.Router();


userRouter.post('/signup', userSignUp)
userRouter.post('/login', userLogin)


userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/verify-otp', VerifyOTP);
userRouter.post('/reset-password', resetPassword);


module.exports = userRouter