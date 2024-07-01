const express = require('express');
const authorizationMiddleware = require('../middlewares/myAuth');
const {spendingHabit, updateSpendingHabit, getAllSpendingHabits } = require('../controllers/spendingHabitController');
const router = express.Router();


router.post('/spendinghabit', authorizationMiddleware, spendingHabit);

router.get('/all_spendinghabits', authorizationMiddleware, getAllSpendingHabits);
router.put('/update_spendinghabit/:id', authorizationMiddleware, updateSpendingHabit);


module.exports = router