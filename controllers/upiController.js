const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const bankModel = require('../models/bankModel');
const transactionModel = require('../models/transactionModel');

async function showPay(req, res) {
  const accounts = await bankModel.getAccountsByUser(req.session.user.user_id);
  res.render('send-money', { title: 'Send Money', accounts });
}

async function verify(req, res) {
  const receiver = await userModel.findByUpiId(req.body.upi_id);
  if (!receiver) {
    return res.status(404).json({ valid: false, message: 'Receiver UPI ID not found.' });
  }

  return res.json({ valid: true, name: receiver.name, upi_id: receiver.upi_id });
}

async function pay(req, res) {
  const connection = await transactionModel.pool.getConnection();

  try {
    const senderId = req.session.user.user_id;
    const { account_no, receiver_upi_id, amount, upi_pin } = req.body;
    const transferAmount = Number(amount);
    const referenceNo = transactionModel.generateReferenceNumber();

    if (!transferAmount || transferAmount <= 0) {
      req.session.message = { type: 'danger', text: 'Enter a valid amount.' };
      return res.redirect('/upi/pay');
    }

    const receiver = await userModel.findByUpiId(receiver_upi_id);
    if (!receiver || receiver.user_id === senderId) {
      req.session.message = { type: 'danger', text: 'Invalid receiver UPI ID.' };
      return res.redirect('/upi/pay');
    }

    await connection.beginTransaction();

    // Lock sender account row so two transfers cannot spend the same balance at once.
    const [senderRows] = await connection.execute(
      'SELECT * FROM bank_accounts WHERE account_no = ? AND user_id = ? FOR UPDATE',
      [account_no, senderId]
    );
    const senderAccount = senderRows[0];

    if (!senderAccount) {
      await connection.rollback();
      req.session.message = { type: 'danger', text: 'Sender account not found.' };
      return res.redirect('/upi/pay');
    }

    const isPinValid = await bcrypt.compare(upi_pin, senderAccount.upi_pin);
    if (!isPinValid) {
      await connection.execute(
        `INSERT INTO transactions
          (sender_id, receiver_id, account_no, reference_no, amount, status, transaction_type)
         VALUES (?, ?, ?, ?, ?, 'FAILED', 'DEBIT')`,
        [senderId, receiver.user_id, account_no, referenceNo, transferAmount]
      );
      await connection.commit();
      req.session.message = { type: 'danger', text: 'Invalid UPI PIN. Transaction failed.' };
      return res.redirect('/upi/pay');
    }

    if (Number(senderAccount.balance) < transferAmount) {
      await connection.execute(
        `INSERT INTO transactions
          (sender_id, receiver_id, account_no, reference_no, amount, status, transaction_type)
         VALUES (?, ?, ?, ?, ?, 'FAILED', 'DEBIT')`,
        [senderId, receiver.user_id, account_no, referenceNo, transferAmount]
      );
      await connection.commit();
      req.session.message = { type: 'danger', text: 'Insufficient Balance.' };
      return res.redirect('/upi/pay');
    }

    const [receiverRows] = await connection.execute(
      'SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY created_at ASC LIMIT 1 FOR UPDATE',
      [receiver.user_id]
    );
    const receiverAccount = receiverRows[0];

    if (!receiverAccount) {
      await connection.execute(
        `INSERT INTO transactions
          (sender_id, receiver_id, account_no, reference_no, amount, status, transaction_type)
         VALUES (?, ?, ?, ?, ?, 'FAILED', 'DEBIT')`,
        [senderId, receiver.user_id, account_no, referenceNo, transferAmount]
      );
      await connection.commit();
      req.session.message = { type: 'danger', text: 'Receiver has no linked bank account.' };
      return res.redirect('/upi/pay');
    }

    await connection.execute(
      'UPDATE bank_accounts SET balance = balance - ? WHERE account_no = ?',
      [transferAmount, account_no]
    );
    await connection.execute(
      'UPDATE bank_accounts SET balance = balance + ? WHERE account_no = ?',
      [transferAmount, receiverAccount.account_no]
    );
    await connection.execute(
      `INSERT INTO transactions
        (sender_id, receiver_id, account_no, reference_no, amount, status, transaction_type)
       VALUES (?, ?, ?, ?, ?, 'SUCCESS', 'DEBIT')`,
      [senderId, receiver.user_id, account_no, referenceNo, transferAmount]
    );

    await connection.commit();
    req.session.message = {
      type: 'success',
      text: `Payment successful. Reference No: ${referenceNo}`
    };
    return res.redirect('/transaction/history');
  } catch (error) {
    await connection.rollback();
    console.error(error);
    req.session.message = { type: 'danger', text: 'Transaction failed. Please try again.' };
    return res.redirect('/upi/pay');
  } finally {
    connection.release();
  }
}

module.exports = {
  showPay,
  pay,
  verify
};
