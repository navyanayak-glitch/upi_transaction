CREATE DATABASE IF NOT EXISTS upi_transaction_system;
USE upi_transaction_system;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS bank_accounts;
DROP TABLE IF EXISTS banks;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone_no VARCHAR(15) NOT NULL UNIQUE,
  email_id VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  upi_id VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE banks (
  bank_id INT AUTO_INCREMENT PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL UNIQUE,
  api_endpoint VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bank_accounts (
  account_no VARCHAR(30) PRIMARY KEY,
  user_id INT NOT NULL,
  bank_id INT NOT NULL,
  ifsc_code VARCHAR(20) NOT NULL,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  upi_pin VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_account_balance CHECK (balance >= 0),
  CONSTRAINT fk_bank_accounts_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bank_accounts_bank
    FOREIGN KEY (bank_id) REFERENCES banks(bank_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE transactions (
  tr_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  account_no VARCHAR(30) NOT NULL,
  reference_no VARCHAR(50) NOT NULL UNIQUE,
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL DEFAULT 'PENDING',
  transaction_type ENUM('DEBIT', 'CREDIT') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_transaction_amount CHECK (amount > 0),
  CONSTRAINT fk_transactions_sender
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_receiver
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_account
    FOREIGN KEY (account_no) REFERENCES bank_accounts(account_no)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_transactions_reference ON transactions(reference_no);

INSERT INTO banks (bank_name, api_endpoint) VALUES
('SBI', 'https://api.sbi.example/upi'),
('HDFC', 'https://api.hdfc.example/upi'),
('ICICI', 'https://api.icici.example/upi'),
('Canara Bank', 'https://api.canara.example/upi'),
('Axis Bank', 'https://api.axis.example/upi');
