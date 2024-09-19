const reportModel = require('../models/reportModel')
const userModel = require('../models/userModel')

//create a report and send to admin department
const createReport = async(req, res)=>{
    const {userId} = req.body
    try {
        //check user existing
        const user = await userModel.findById(req.user.id);
        if(!user) return res.status(404).json({message: "User not found"})
        
        const report = new reportModel({
            userId: req.user.id,
            messageReport: req.body.message
        })
        await report.save()
        return res.status(201).json({message: "Report created successfully"});
    } catch (error) {
        console.log("Error: ", error)
        return res.status(500).json({message: "Error creating report"})
    }
}

//Get all reports by Admin
const getAllReports = async (req, res) => {
    try {
      // Check if the user is an admin
      if (req.user && req.user.role === 'admin') {
      //check if the admin is activated or deactivated
      const requestingAdmin = await userModel.findById(req.user.id);
      if(!requestingAdmin || requestingAdmin.activation === false){
        return res.status(403).json({message: "Access denied. Your account is deactivated."})
      }
        // Fetch all users and exclude the password field
        const reports = await reportModel.findById(req.user.id);
        return res.status(200).json(reports);
      } else {
        // Return forbidden if the user is not an admin
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
  

module.exports = {createReport, getAllReports}