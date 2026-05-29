const mysql = require('mysql2/promise');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

let connectionConfig;

if (databaseUrl) {
  const parsed = new URL(databaseUrl);
  connectionConfig = {
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.replace(/^\//, ''),
  };
} else {
  connectionConfig = {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'upi_transaction_system',
  };
}

const pool = mysql.createPool({
  ...connectionConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
