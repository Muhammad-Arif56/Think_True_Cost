const Jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpGenerate = require("../utils/otpGenerate.js");
const generateRandomString = require("../utils/generateRandomString");
const otpResetModel = require("../models/otpResetModel");
const accountMail = require("../utils/sendEmail");
const User = require("../models/User.js");
const {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
// s3 create
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const Signup = async (req, res) => {
  const checkemail = await User.findOne({
    email: req.body.email.toLowerCase(),
  });
  const salt = await bcrypt.genSalt(15);
  const hashpassword = await bcrypt.hash(req.body.password, salt);
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email.toLowerCase(),
      password: hashpassword,
      country: req.body.country,
      // deviceToken: req.body.deviceToken,
    });
    if (checkemail)
      return res
        .status(409)
        .json({ code: 409, message: "Email Already Exists" });
    const savedUser = await newUser.save();
    const accessToken = Jwt.sign(
      {
        isAdmin: savedUser.isAdmin,
        _id: savedUser.id,
      },
      process.env.JWT_SEC,
      { expiresIn: "30d" }
    );
    res.status(200).json({
      message: "User Registered",
      user: savedUser,
      accessToken,
    });
  } catch (err) {
    res
      .status(500)
      .json({ code: 500, message: "Error while Registering User" });
  }
};
const Login = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (!user) {
      return res.status(401).json({ code: 401, message: "User not found" });
    }
    const comparepass = await bcrypt.compare(req.body.password, user.password);
    if (!comparepass) {
      return res
        .status(401)
        .json({ code: 401, message: "Invalid Credentials" });
    }

    // Update device token
    // user.deviceToken = req.body.deviceToken;

    await user.save();
    const { password, ...others } = user._doc;
    const accessToken = Jwt.sign(
      {
        isAdmin: user.isAdmin,
        _id: user.id,
      },
      process.env.JWT_SEC,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      code: 200,
      message: "User Logged In Successfully",
      user: others,
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Error Occurred" });
  }
};
const ForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const trimmedEmail = email.trim();
    const lowercaseEmail = trimmedEmail.toLowerCase();
    existingUser = await User.findOne({ email: lowercaseEmail });
    // Regular expression to validate the email format
    const user = await User.findOne({
      email: lowercaseEmail,
    });
    if (!user) {
      return res
        .status(401)
        .json({ code: 401, message: "User does not exist with this email" });
    }
    await otpResetModel.deleteMany({ userId: user._id });
    const otp = otpGenerate();
    const resetOtp = new otpResetModel({
      userId: user.id,
      otp,
    });
    await resetOtp.save();
    await accountMail(user.email, "Reset Password OTP", otp);
    res.status(200).json({ message: "Reset OTP Sent to your given email" });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error while Requesting Password Reset Request ",
    });
  }
};
const VerifyOTP = async (req, res) => {
  try {
    const resetOtp = await otpResetModel.findOne({ otp: req.body.otp });
    if (!resetOtp) {
      return res.status(404).json({ code: 404, message: "Invalid OTP" });
    }
    res.status(200).json({ data: resetOtp });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
const ResetPassword = async (req, res) => {
  const password = req.body.password;
  const resetOtp = await otpResetModel.findOne({
    otp: req.body.otp,
    userId : req.body.userId
  });
  if (!resetOtp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }
  const salt = await bcrypt.genSalt(15);
  const hashpassword = await bcrypt.hash(password, salt);
  try {
    await User.findByIdAndUpdate(resetOtp.userId, {
      $set: {
        password: hashpassword,
      },
    });
    await otpResetModel.deleteMany({ userId: resetOtp.userId });
    return res
      .status(200)
      .json({ code: 200, message: "Password Updated successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Error While Reset Password" });
  }
};
const Dashboard = async (req, res) => {
  try {
    const admins = await User.countDocuments({ isAdmin: true });
    const users = await User.countDocuments();
    const usersData = await User.find({ isAdmin: false }).select("createdAt");
    res.status(200).json({ admins, users, usersData });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: "Error Getting Dashboard Data" });
  }
};
const RegisterAdmin = async (req, res) => {
  try {
    const checke = await User.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (checke)
      return res.status(409).json({
        code: 409,
        message: "Admin with this Email Already Exists",
      });
    let imageUrl = "";
    if (req.file) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: generateRandomString() + req.file.originalname,
        Body: req.file.buffer,
      };
      const command = new PutObjectCommand(params);
      const data = await s3.send(command);
      imageUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    }
    if (req.body.password !== req.body.confirmpassword)
      return res
        .status(400)
        .json({ code: 400, message: "Passsword Not Matched" });

    const salt = await bcrypt.genSalt(12);
    const hashpassword = await bcrypt.hash(req.body.password, salt);
    const newAdmin = new User({
      username: req.body.username,
      email: req.body.email.toLowerCase(),
      profileImage: imageUrl,
      password: hashpassword,
      isAdmin: true,
    });
    const savedAdmin = await newAdmin.save();
    res
      .status(200)
      .json({ code: 200, message: "Admin Registered", savedAdmin });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Error Registering Admin" });
  }
};
const Loginadmin = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (!user) {
      return res.status(401).json({ code: 401, error: "User not found" });
    }
    const comparepass = await bcrypt.compare(req.body.password, user.password);
    if (!comparepass) {
      return res.status(401).json({ code: 401, error: "Invalid Password" });
    }
    const { password, ...others } = user._doc;
    const accessToken = Jwt.sign(
      {
        isAdmin: user.isAdmin,
        _id: user.id,
      },
      process.env.JWT_SEC,
      { expiresIn: "30d" }
    );
    user.deviceToken = req.body.deviceToken;
    res.status(200).json({
      code: 200,
      message: "User Loged In Successfully",
      ...others,
      accessToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, error: "Error Occured" });
  }
};
const AllUSers = async (req, res) => {
  try {
    const usersData = await User.find({ isAdmin: false })
      .select("username email createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ usersData });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Error Getting Users Data" });
  }
};
const GetUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res.status(404).json({
        code: 404,
        error: "User Not Found",
      });
    res.status(200).json({ code: 200, message: "User Details", user });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: "Error Getting User Details " + error.message,
    });
  }
};
const DeleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }
    await User.findByIdAndDelete(userId);
    res.status(200).json({ code: 200, message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: "Error while processing request" });
  }
};
const GetAllAdmins = async (req, res) => {
  try {
    const allAdmins = await User.find({
      isAdmin: true,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json({ code: 200, admins: allAdmins });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Error While Getting Admins" });
  }
};
const EditProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.username = username;
    await user.save();
    res
      .status(200)
      .json({ message: "User profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  Signup,
  Login,
  ForgotPassword,
  VerifyOTP,
  ResetPassword,
  Dashboard,
  RegisterAdmin,
  Loginadmin,
  AllUSers,
  GetUserDetails,
  DeleteUser,
  GetAllAdmins,
  EditProfile,
};
