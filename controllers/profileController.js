const multer  = require('multer');
const dotenv =  require('dotenv');
const path = require('path');
dotenv.config()
// const userProfileModel = require('../models/profileModel');
// const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require('multer-s3');
const s3 = new S3Client({
  credentials:{
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_REGION
})


// Multer configuration for file upload
const storage =   multerS3({
  s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now().toString()}${ext}`;
      cb(null, filename);
    },

    limits: {
      fileSize: 1024 * 1024 * 5 // 5 MB
    },
    fileFilter: function (req, file, cb) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    }
});
exports.upload = multer({ storage: storage });


//updating user profile...
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
          console.log("🚀 ~ exports.updateProfile= ~ user:", user)
          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }
          console.log(req.user.id);
    let updatedFields = req.body;
    if (req.file) {
             updatedFields.profileImage = req.file?.location
            }
    console.log("🚀 ~ exports.updateProfile= ~ updatedFields:", updatedFields)

    const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields},
      { new: true }
    );
    console.log("🚀 ~ exports.updateProfile= ~ updateUser:", updateUser)
    if (!updateUser)
      return res.status(401).json({ code: 401, error: "User not found" });
    
    const {password, ...other} = JSON.parse(JSON.stringify(updateUser));

    res.status(200).json({ code: 200, message: "User updated successfully" ,updateUser:{...other}});
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, error: "Error While Updating Data" });
  }
};

//Delet Profile Photo
exports.deletePhoto = async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      user.profileImage = null; // or user.picture = null; depending on the field name
      await user.save();
      return res.json({ message: 'Photo Removed successfully' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
}