USE upi_transaction_system;

INSERT IGNORE INTO banks (bank_name, api_endpoint) VALUES
('SBI', 'https://api.sbi.example/upi'),
('HDFC', 'https://api.hdfc.example/upi'),
('ICICI', 'https://api.icici.example/upi'),
('Canara Bank', 'https://api.canara.example/upi'),
('Axis Bank', 'https://api.axis.example/upi');
