const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SecretKey = "thisisoursecretkey";
const otpGenerate = require('../utils/otpGenerate.js');
const generateRandomString = require('../utils/generateRandomString');
const otpResetModel = require('../models/otpResetModel');
const accountMail = require("../utils/sendEmail");



//Signing Up User
const userSignUp = async (req, res) => {
  const {name, email, country, role} = req.body
  try {
      if (!name || !email || !req.body.password || !country) {
          return res.status(400).json({message: "Please enter all credentials"})
      }
      // Normalize the email format
      const trimmedEmail = email.trim();
      const lowercaseEmail = trimmedEmail.toLowerCase();

      // Regular expression to validate the email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|int)$/;
      if (!emailRegex.test(lowercaseEmail)) {
          return res.status(400).json({ message: "Invalid email format" });
      }

     if((req.body.password).length < 8){
      return res.status(400).json({message: "Password should be at least 8 characters"})
     }
  
      //Check if the user is already signed up
      const existingUser = await userModel.findOne({email:lowercaseEmail})
      if (existingUser) {
        const message = existingUser.role === 'admin' ? "Admin already exist with this email" : "User already exist with this email"
          return res.status(400).json({message:message})
      }
      //Hashing the password
      const hashPassword = await bcrypt.hash(req.body.password, 10)
      //Creating user
      const newUser = new userModel(
          {
            name:name,
              email:lowercaseEmail, 
              password:hashPassword,
              country: country,
              role: role || 'user'
          })
          const saveUser = await newUser.save()
          const { password, ...others } = saveUser._doc;
          const token = await jwt.sign({email:saveUser.email, id:saveUser._id, role: saveUser.role}, SecretKey)
          const message = saveUser.role === 'admin' ? "Hurray! Admin Signed Up" : "Hurray! User Signed Up"
          return res.status(200).json({message, ...others, token})
  } catch (error) {
    console.log(error);
      return res.status(500).json({message: "Server error: " + error.message})
  }

}


//Loign the User
const userLogin = async (req, res) => {
  const {email} = req.body
  try {
      if(!email || !req.body.password) {
          return res.status(400).json({message: "Please enter all required information"})
      }
      const trimmedEmail = email.trim()
      const lowercaseEmail = trimmedEmail.toLowerCase()
      existingUser = await userModel.findOne({email: lowercaseEmail})
      // Regular expression to validate the email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|int)$/;
      if (!emailRegex.test(lowercaseEmail)) {
          return res.status(400).json({ message: "Invalid email format" });
      }
      if(!existingUser){
          return res.status(404).json({message:"User does not exist, please sign up first"})
      }
      const matchPassword = await bcrypt.compare(req.body.password, existingUser.password)
      if(!matchPassword){
          return res.status(400).json({message: "Invalid password"})
      }

      // Check if the user is an admin
      if (existingUser.role === 'admin') {
        // Perform any additional logic specific to admin login if needed
        console.log("Admin logged in");
    } else if (existingUser.role === 'user') {
        // Logic for regular user login
        console.log("User logged in");
    }
      const { password, ...others } = existingUser._doc;
      const token = await jwt.sign({email:existingUser.email, id:existingUser._id, role: existingUser.role},SecretKey)
      return res.status(200).json({...others , token})
  } catch (error) {
    console.log("Error : ", error);
      return res.status(500).json({message: "Server error: " + error.message})
  }
}


//Get all users by Admin
const getAllUsers = async (req, res) => {
try {
  // Check if the user is an admin
  if (req.user && req.user.role === 'admin') {
    // Fetch all users and exclude the password field
    const users = await userModel.find({ role: { $ne: 'admin' } }).select('-password');
    return res.status(200).json(users);
  } else {
    // Return forbidden if the user is not an admin
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: "Server error" });
}
}



//Get all Admins 
const getAllAdmins = async (req, res) => {
try {
  // Check if the user is an admin
  if (req.user && req.user.role === 'admin') {
    // Fetch all users and exclude the password field
    const admins = await userModel.find({ role:'admin' }).select('-password');
    return res.status(200).json(admins);
  } else {
    // Return forbidden if the user is not an admin
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: "Server error" });
}
}


const getAdminById = async (req, res) => {
try {
  // Check if the user is an admin
  if (req.user && req.user.role === 'admin') {
    const{userId} = req.params
    // Fetch all users and exclude the password field
    const admin = await userModel.find( {_id: userId,  role:'admin' }).select('-password');
    if(!admin){
      return res.status(404).json({message:"Admin not found by this id"})
    }
    return res.status(200).json(admin);
  } else {
    // Return forbidden if the user is not an admin
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: "Server error" });
}
}


//view user bu id
const getUserById = async (req, res) => {
try {
  console.log("*********************");
  
  // Check if the user is an admin
  if (req.user && req.user.role === 'admin') {
    // Fetch the user by ID from req.params
    const { userId } = req.params;
    const user = await userModel.findById(userId).select('-password');
  
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } else {
    // Return forbidden if the user is not an admin
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: "Server error" });
}
}



//Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const trimmedEmail = email.trim()
    const lowercaseEmail = trimmedEmail.toLowerCase()
    existingUser = await userModel.findOne({email: lowercaseEmail})
    // Regular expression to validate the email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|int)$/;
    if (!emailRegex.test(lowercaseEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    const user = await userModel.findOne({
      email: lowercaseEmail
    });
    if (!user) {
      return res.status(401).json({error: "User does not exist with this email" });
    }
    await otpResetModel.deleteMany({ userId: user._id });
    const otp = otpGenerate();
    const resetOtp = new otpResetModel({
      userId: user.id,
      otp,
    });
    await resetOtp.save();
    await accountMail(user.email, "Reset Password OTP", otp);
    res.status(200).json({message: "Reset OTP Sent to your given email" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      code: 500,
      error: "Error while Requesting Password Reset Request ",
    });
      console.log("🚀 ~ res.status ~ error:", error)
  }
};


//Verify OTP
const VerifyOTP = async (req, res) => {
    try {
      const resetOtp = await otpResetModel.findOne({ otp: req.body.otp });
      if (!resetOtp) {
        return res.status(404).json({message: "Invalid OTP" });
      }
      
      res.status(200).json({data: resetOtp });
    } catch (error) {
      res.status(500).json({error: "Server Error" });
    }
  };


//Reset Password
const resetPassword = async (req, res) => {
    const password = req.body.password;
    const resetOtp = await otpResetModel.findOne({
      otp: req.body.otp,
      // userId: req.body.userId,
    });
    if (!resetOtp) {
      return res.status(401).json({message: "Invalid OTP" });
    }
    // const salt = await bcrypt.genSalt(15);
    const hashpassword = await bcrypt.hash(password, 10);
    // console.log("aaaaaaaaaaaaaaaaaaaaaaa");
    try {
      await userModel.findByIdAndUpdate(resetOtp.userId, {
        $set: {
          password: hashpassword,
        },
      });
      await otpResetModel.deleteMany({ userId: resetOtp.userId });
      return res
        .status(200)
        .json({message: "Password Updated successfully" });
    } catch (error) {
        console.log(error);
      res.status(500).json({message: "Error While Reset Password" });
    }

  };


  module.exports = {userSignUp, userLogin, getAllUsers,getUserById,getAllAdmins, getAdminById, forgotPassword, VerifyOTP, resetPassword}