const express = require('express');
const authController = require('../controllers/authController');
const { isGuest } = require('../middleware/authMiddleware');
const { requireFields } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/signup', isGuest, authController.showSignup);
router.post(
  '/signup',
  isGuest,
  requireFields(['name', 'phone_no', 'email_id', 'password', 'upi_id']),
  authController.signup
);

router.get('/login', isGuest, authController.showLogin);
router.post('/login', isGuest, requireFields(['email_id', 'password']), authController.login);
router.get('/logout', authController.logout);

module.exports = router;
