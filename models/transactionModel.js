const pool = require('../database/db');

function generateReferenceNumber() {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `UPI${Date.now()}${randomPart}`;
}

async function getTransactionsByUser(userId, filters = {}) {
  const values = [userId, userId];
  let filterSql = '';

  if (filters.reference_no) {
    filterSql += ' AND t.reference_no LIKE ?';
    values.push(`%${filters.reference_no}%`);
  }

  if (filters.status) {
    filterSql += ' AND t.status = ?';
    values.push(filters.status);
  }

  if (filters.direction === 'sent') {
    filterSql += ' AND t.sender_id = ?';
    values.push(userId);
  }

  if (filters.direction === 'received') {
    filterSql += ' AND t.receiver_id = ?';
    values.push(userId);
  }

  if (filters.date_from) {
    filterSql += ' AND DATE(t.created_at) >= ?';
    values.push(filters.date_from);
  }

  if (filters.date_to) {
    filterSql += ' AND DATE(t.created_at) <= ?';
    values.push(filters.date_to);
  }

  if (filters.amount_min) {
    filterSql += ' AND t.amount >= ?';
    values.push(filters.amount_min);
  }

  if (filters.amount_max) {
    filterSql += ' AND t.amount <= ?';
    values.push(filters.amount_max);
  }

  const sql = `
    SELECT
      t.*,
      sender.name AS sender_name,
      sender.upi_id AS sender_upi,
      receiver.name AS receiver_name,
      receiver.upi_id AS receiver_upi,
      b.bank_name
    FROM transactions t
    INNER JOIN users sender ON t.sender_id = sender.user_id
    INNER JOIN users receiver ON t.receiver_id = receiver.user_id
    INNER JOIN bank_accounts ba ON t.account_no = ba.account_no
    INNER JOIN banks b ON ba.bank_id = b.bank_id
    WHERE (t.sender_id = ? OR t.receiver_id = ?) ${filterSql}
    ORDER BY t.created_at DESC
  `;
  const [rows] = await pool.execute(sql, values);
  return rows;
}

async function getTransactionSummary(userId) {
  const sql = `
    SELECT
      COALESCE(SUM(CASE WHEN sender_id = ? AND status = 'SUCCESS' THEN amount ELSE 0 END), 0) AS total_sent,
      COALESCE(SUM(CASE WHEN receiver_id = ? AND status = 'SUCCESS' THEN amount ELSE 0 END), 0) AS total_received,
      COALESCE(SUM(CASE WHEN sender_id = ? AND status = 'SUCCESS' AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURRENT_DATE(), '%Y-%m') THEN amount ELSE 0 END), 0) AS month_sent,
      COALESCE(SUM(CASE WHEN receiver_id = ? AND status = 'SUCCESS' AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURRENT_DATE(), '%Y-%m') THEN amount ELSE 0 END), 0) AS month_received,
      SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS success_count,
      SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed_count,
      COUNT(*) AS total_count,
      MAX(created_at) AS last_activity_at
    FROM transactions
    WHERE sender_id = ? OR receiver_id = ?
  `;
  const [rows] = await pool.execute(sql, [userId, userId, userId, userId, userId, userId]);
  return rows[0];
}

async function getRecentTransactions(userId) {
  const sql = `
    SELECT t.*, sender.upi_id AS sender_upi, receiver.upi_id AS receiver_upi
    FROM transactions t
    INNER JOIN users sender ON t.sender_id = sender.user_id
    INNER JOIN users receiver ON t.receiver_id = receiver.user_id
    WHERE t.sender_id = ? OR t.receiver_id = ?
    ORDER BY t.created_at DESC
    LIMIT 5
  `;
  const [rows] = await pool.execute(sql, [userId, userId]);
  return rows;
}

async function getTransactionById(transactionId, userId) {
  const sql = `
    SELECT
      t.*,
      sender.name AS sender_name,
      sender.upi_id AS sender_upi,
      receiver.name AS receiver_name,
      receiver.upi_id AS receiver_upi,
      b.bank_name
    FROM transactions t
    INNER JOIN users sender ON t.sender_id = sender.user_id
    INNER JOIN users receiver ON t.receiver_id = receiver.user_id
    INNER JOIN bank_accounts ba ON t.account_no = ba.account_no
    INNER JOIN banks b ON ba.bank_id = b.bank_id
    WHERE t.tr_id = ? AND (t.sender_id = ? OR t.receiver_id = ?)
  `;
  const [rows] = await pool.execute(sql, [transactionId, userId, userId]);
  return rows[0];
}

async function getLatestReceivedTransaction(userId) {
  const sql = `
    SELECT
      t.tr_id,
      t.reference_no,
      t.amount,
      t.created_at,
      sender.name AS sender_name,
      sender.upi_id AS sender_upi
    FROM transactions t
    INNER JOIN users sender ON t.sender_id = sender.user_id
    WHERE t.receiver_id = ? AND t.status = 'SUCCESS'
    ORDER BY t.created_at DESC
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [userId]);
  return rows[0] || null;
}

async function createFailedTransaction(transaction) {
  const sql = `
    INSERT INTO transactions
      (sender_id, receiver_id, account_no, reference_no, amount, status, transaction_type)
    VALUES (?, ?, ?, ?, ?, 'FAILED', 'DEBIT')
  `;
  await pool.execute(sql, [
    transaction.sender_id,
    transaction.receiver_id,
    transaction.account_no,
    transaction.reference_no,
    transaction.amount
  ]);
}

module.exports = {
  pool,
  generateReferenceNumber,
  getTransactionsByUser,
  getTransactionSummary,
  getRecentTransactions,
  getTransactionById,
  getLatestReceivedTransaction,
  createFailedTransaction
};
