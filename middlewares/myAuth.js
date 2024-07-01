const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const SecretKey = "thisisoursecretkey";

const authorizationMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.sendStatus(401);
    const decoded = jwt.verify(token, SecretKey);
    const userId = await User.findById(decoded.id);
    // console.log("🚀 ~ authorizationMiddleware ~ user:", userId)
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    req.user = userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
};

module.exports = authorizationMiddleware;