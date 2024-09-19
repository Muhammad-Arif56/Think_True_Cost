const express = require("express");
const router = express.Router();
const { createReport, getReports, getReportById, updateReport, deleteReport } = require("../controllers/reportController");

// Create a new report
router.post("/submit-report", createReport);

// Get all reports
router.get("/get-reports", getReports);

// Get a specific report by ID
router.get("/report-details/:id", getReportById);

// Update a report by ID
router.put("/update-report/:id", updateReport);

// Delete a report by ID
router.delete("/delete-report/:id", deleteReport);

module.exports = router;
