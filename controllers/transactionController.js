const transactionModel = require('../models/transactionModel');

async function history(req, res) {
  const transactions = await transactionModel.getTransactionsByUser(req.session.user.user_id, {
    reference_no: req.query.reference_no,
    status: req.query.status
  });

  res.render('history', {
    title: 'Transaction History',
    transactions,
    filters: req.query
  });
}

async function detail(req, res) {
  const transaction = await transactionModel.getTransactionById(
    req.params.id,
    req.session.user.user_id
  );

  if (!transaction) {
    return res.status(404).render('error', {
      title: 'Transaction Not Found',
      errorCode: 404,
      errorMessage: 'Transaction not found for your account.'
    });
  }

  return res.render('transaction-detail', {
    title: 'Transaction Detail',
    transaction
  });
}

async function latestReceived(req, res) {
  const transaction = await transactionModel.getLatestReceivedTransaction(req.session.user.user_id);

  return res.json({
    transaction: transaction
      ? {
          tr_id: transaction.tr_id,
          reference_no: transaction.reference_no,
          amount: Number(transaction.amount),
          created_at: transaction.created_at,
          sender_name: transaction.sender_name,
          sender_upi: transaction.sender_upi
        }
      : null
  });
}

module.exports = {
  history,
  detail,
  latestReceived
};
