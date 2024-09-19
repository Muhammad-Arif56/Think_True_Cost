const Report = require("../models/Report");
const createReport = async (req, res) => {
  const { userId, description } = req.body;

  try {
    const newReport = new Report({
      userId,
      description,
    });

    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("userId", "name email"); // Populating user data
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("userId", "name email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateReport = async (req, res) => {
  const { description } = req.body;

  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.description = description || report.description;

    const updatedReport = await report.save();
    res.status(200).json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    await report.remove();
    res.status(200).json({ message: "Report removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
};
