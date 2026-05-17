const pool = require('../database/db');

async function createUser(user) {
  const sql = `
    INSERT INTO users (name, phone_no, email_id, password, upi_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [
    user.name,
    user.phone_no,
    user.email_id,
    user.password,
    user.upi_id
  ]);
  return result.insertId;
}

async function findByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email_id = ?', [email]);
  return rows[0];
}

async function findById(userId) {
  const [rows] = await pool.execute(
    'SELECT user_id, name, phone_no, email_id, upi_id, created_at FROM users WHERE user_id = ?',
    [userId]
  );
  return rows[0];
}

async function findByUpiId(upiId) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE upi_id = ?', [upiId]);
  return rows[0];
}

async function checkUniqueUser(email, phone, upiId) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email_id = ? OR phone_no = ? OR upi_id = ?',
    [email, phone, upiId]
  );
  return rows[0];
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findByUpiId,
  checkUniqueUser
};
