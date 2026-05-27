const transactionModel = require('../models/transactionModel');

async function history(req, res) {
  const transactions = await transactionModel.getTransactionsByUser(req.session.user.user_id, {
    reference_no: req.query.reference_no,
    status: req.query.status,
    direction: req.query.direction,
    date_from: req.query.date_from,
    date_to: req.query.date_to,
    amount_min: req.query.amount_min,
    amount_max: req.query.amount_max
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

function csvCell(value) {
  const safeValue = value === null || value === undefined ? '' : String(value);
  return `"${safeValue.replace(/"/g, '""')}"`;
}

async function exportHistory(req, res) {
  const transactions = await transactionModel.getTransactionsByUser(req.session.user.user_id, {
    reference_no: req.query.reference_no,
    status: req.query.status,
    direction: req.query.direction,
    date_from: req.query.date_from,
    date_to: req.query.date_to,
    amount_min: req.query.amount_min,
    amount_max: req.query.amount_max
  });

  const rows = [
    ['Reference', 'Direction', 'Sender UPI', 'Receiver UPI', 'Amount', 'Status', 'Bank', 'Date'],
    ...transactions.map((transaction) => [
      transaction.reference_no,
      transaction.sender_id === req.session.user.user_id ? 'Sent' : 'Received',
      transaction.sender_upi,
      transaction.receiver_upi,
      Number(transaction.amount).toFixed(2),
      transaction.status,
      transaction.bank_name,
      new Date(transaction.created_at).toLocaleString()
    ])
  ];

  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="upi-transactions.csv"');
  return res.send(csv);
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
  exportHistory,
  detail,
  latestReceived
};
