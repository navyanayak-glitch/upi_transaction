const express = require('express');
const upiController = require('../controllers/upiController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { requireFields } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/pay', isAuthenticated, upiController.showPay);
router.post(
  '/pay',
  isAuthenticated,
  requireFields(['account_no', 'receiver_upi_id', 'amount', 'upi_pin']),
  upiController.pay
);
router.post('/verify', isAuthenticated, requireFields(['upi_id']), upiController.verify);

module.exports = router;
