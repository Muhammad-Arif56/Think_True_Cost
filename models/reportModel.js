const mongoose = require('mongoose');
const reportModel = mongoose.Schema({
    message: String,

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
},  { timestamps: true }
)

module.exports = mongoose.model("Report", reportModel)