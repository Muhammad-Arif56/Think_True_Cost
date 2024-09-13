const express = require('express');
const authorizationMiddleware = require('../middlewares/myAuth');
const { oneTimePurchase, getAllPurchases, updatePurchase,  } = require('../controllers/purchaseController');
const router = express.Router();

router.post('/oneTimePurchase', authorizationMiddleware, oneTimePurchase);

router.get('/all_purchases/:id', authorizationMiddleware, getAllPurchases);
router.put('/update_purchase/:id', authorizationMiddleware, updatePurchase);

module.exports = router