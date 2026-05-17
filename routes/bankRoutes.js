const express = require('express');
const bankController = require('../controllers/bankController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { requireFields } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/add-account', isAuthenticated, bankController.showAddAccount);
router.post(
  '/add-account',
  isAuthenticated,
  requireFields(['account_no', 'bank_id', 'ifsc_code', 'balance', 'upi_pin']),
  bankController.addAccount
);
router.get('/accounts', isAuthenticated, bankController.accounts);

module.exports = router;
