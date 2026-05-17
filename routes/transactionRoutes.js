const express = require('express');
const transactionController = require('../controllers/transactionController');
const upiController = require('../controllers/upiController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/send', isAuthenticated, upiController.showPay);
router.get('/history', isAuthenticated, transactionController.history);
router.get('/:id', isAuthenticated, transactionController.detail);

module.exports = router;
