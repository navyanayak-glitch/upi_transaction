const userModel = require('../models/userModel');
const bankModel = require('../models/bankModel');
const transactionModel = require('../models/transactionModel');

async function dashboard(req, res) {
  const userId = req.session.user.user_id;
  const accounts = await bankModel.getAccountsByUser(userId);
  const recentTransactions = await transactionModel.getRecentTransactions(userId);
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);

  res.render('dashboard', {
    title: 'Dashboard',
    accounts,
    recentTransactions,
    totalBalance
  });
}

async function profile(req, res) {
  const user = await userModel.findById(req.session.user.user_id);
  const accounts = await bankModel.getAccountsByUser(req.session.user.user_id);

  res.render('profile', {
    title: 'Profile',
    user,
    accounts
  });
}

module.exports = {
  dashboard,
  profile
};
