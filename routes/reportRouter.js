const express = require('express');
const authorizationMiddleware = require('../middlewares/myAuth');
const adminAccess = require('../middlewares/adminAccessMiddleware');
const { createReport, getAllReports } = require('../controllers/reportController');
const reportRouter = express.Router();

reportRouter.post('/create-report', authorizationMiddleware, createReport);
reportRouter.get('/all-reports', authorizationMiddleware, adminAccess, getAllReports);

module.exports = reportRouter