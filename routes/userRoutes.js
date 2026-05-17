const express = require('express');
const userController = require('../controllers/userController');
const bankController = require('../controllers/bankController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', isAuthenticated, userController.dashboard);
router.get('/profile', isAuthenticated, userController.profile);
router.get('/banks', isAuthenticated, bankController.listBanks);

module.exports = router;
