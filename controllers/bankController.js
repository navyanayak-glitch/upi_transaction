const bcrypt = require('bcrypt');
const bankModel = require('../models/bankModel');

async function listBanks(req, res) {
  const banks = await bankModel.getAllBanks();
  res.render('banks', { title: 'Banks', banks });
}

async function showAddAccount(req, res) {
  const banks = await bankModel.getAllBanks();
  res.render('add-account', { title: 'Add Bank Account', banks });
}

async function addAccount(req, res) {
  try {
    const { account_no, bank_id, ifsc_code, balance, upi_pin } = req.body;
    const existingAccount = await bankModel.getAccountByNumber(account_no);

    if (existingAccount) {
      req.session.message = { type: 'danger', text: 'Account number already exists.' };
      return res.redirect('/bank/add-account');
    }

    if (Number(balance) < 0) {
      req.session.message = { type: 'danger', text: 'Initial balance cannot be negative.' };
      return res.redirect('/bank/add-account');
    }

    const hashedPin = await bcrypt.hash(upi_pin, 10);
    await bankModel.addAccount({
      account_no,
      user_id: req.session.user.user_id,
      bank_id,
      ifsc_code,
      balance,
      upi_pin: hashedPin
    });

    req.session.message = { type: 'success', text: 'Bank account linked successfully.' };
    return res.redirect('/bank/accounts');
  } catch (error) {
    console.error(error);
    req.session.message = { type: 'danger', text: 'Unable to link bank account.' };
    return res.redirect('/bank/add-account');
  }
}

async function accounts(req, res) {
  const accounts = await bankModel.getAccountsByUser(req.session.user.user_id);
  res.render('accounts', { title: 'Linked Accounts', accounts });
}

module.exports = {
  listBanks,
  showAddAccount,
  addAccount,
  accounts
};
