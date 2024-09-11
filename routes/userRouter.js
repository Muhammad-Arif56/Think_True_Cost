const express = require('express');
const { userSignUp, userLogin , forgotPassword,VerifyOTP, resetPassword, getAllUsers, getAllAdmins, getUserById , getAdminById, activateOrDeactivateUser, activateOrDeactivateAdmin} = require('../controllers/userController');
const authorizationMiddleware = require('../middlewares/myAuth');
const adminAccess = require('../middlewares/adminAccessMiddleware');
const userRouter = express.Router();


userRouter.post('/signup', userSignUp)
userRouter.post('/login', userLogin)

//admin routes
userRouter.get('/get-all-users/admin', authorizationMiddleware, adminAccess, getAllUsers)
userRouter.get('/get-all-admins/admin', authorizationMiddleware, adminAccess, getAllAdmins)
userRouter.get('/get-user/admin/:userId', authorizationMiddleware, adminAccess, getUserById)
userRouter.get('/get-admin/admin/:userId', authorizationMiddleware, adminAccess, getAdminById)
userRouter.post('/user-activation', authorizationMiddleware, adminAccess, activateOrDeactivateUser)
userRouter.post('/admin-activation', authorizationMiddleware, adminAccess, activateOrDeactivateAdmin)

userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/verify-otp', VerifyOTP);
userRouter.post('/reset-password', resetPassword);


module.exports = userRouter