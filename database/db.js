const mysql = require('mysql2/promise');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

const pool = mysql.createPool({
  connectionUri: databaseUrl || undefined,
  host: databaseUrl ? undefined : process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: databaseUrl ? undefined : Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  user: databaseUrl ? undefined : process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: databaseUrl ? undefined : process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: databaseUrl ? undefined : process.env.DB_NAME || process.env.MYSQLDATABASE || 'upi_transaction_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
