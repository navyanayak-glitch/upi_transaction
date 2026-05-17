const pool = require('../database/db');

async function getAllBanks() {
  const [rows] = await pool.execute('SELECT * FROM banks ORDER BY bank_name');
  return rows;
}

async function addAccount(account) {
  const sql = `
    INSERT INTO bank_accounts (account_no, user_id, bank_id, ifsc_code, balance, upi_pin)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [
    account.account_no,
    account.user_id,
    account.bank_id,
    account.ifsc_code,
    account.balance,
    account.upi_pin
  ]);
  return result.affectedRows;
}

async function getAccountsByUser(userId) {
  const sql = `
    SELECT ba.*, b.bank_name
    FROM bank_accounts ba
    INNER JOIN banks b ON ba.bank_id = b.bank_id
    WHERE ba.user_id = ?
    ORDER BY ba.created_at DESC
  `;
  const [rows] = await pool.execute(sql, [userId]);
  return rows;
}

async function getAccountByNumber(accountNo) {
  const [rows] = await pool.execute('SELECT * FROM bank_accounts WHERE account_no = ?', [accountNo]);
  return rows[0];
}

async function getPrimaryAccountByUser(userId) {
  const [rows] = await pool.execute(
    'SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY created_at ASC LIMIT 1',
    [userId]
  );
  return rows[0];
}

module.exports = {
  getAllBanks,
  addAccount,
  getAccountsByUser,
  getAccountByNumber,
  getPrimaryAccountByUser
};
