const express = require('express');
const { userSignUp, userLogin , forgotPassword,VerifyOTP, resetPassword, getAllUsers, getAllAdmins, getUserById , getAdminById} = require('../controllers/userController');
const authorizationMiddleware = require('../middlewares/myAuth');
const adminAccess = require('../middlewares/adminAccessMiddleware');
const userRouter = express.Router();


userRouter.post('/signup', userSignUp)
userRouter.post('/login', userLogin)
userRouter.get('/get-all-users/admin', authorizationMiddleware, adminAccess, getAllUsers)
userRouter.get('/get-all-admins/admin', authorizationMiddleware, adminAccess, getAllAdmins)
userRouter.get('/get-user/admin/:userId', authorizationMiddleware, adminAccess, getUserById)
userRouter.get('/get-admin/admin/:userId', authorizationMiddleware, adminAccess, getAdminById)

userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/verify-otp', VerifyOTP);
userRouter.post('/reset-password', resetPassword);


module.exports = userRouter