# UPI Transaction Management System

A web-based UPI transaction management application built with Node.js, Express, MySQL, EJS, and Bootstrap. The app supports user registration, login, bank account linking, UPI payments, receiver verification, transaction history, and transaction detail views.

## Features

- User signup, login, logout, and session-based authentication
- Dashboard and profile pages for authenticated users
- Bank listing and bank account linking
- Secure password and UPI PIN hashing with bcrypt
- UPI receiver verification by UPI ID
- Money transfer with balance checks and database transactions
- Transaction status tracking for successful and failed payments
- Transaction history with filters
- Transaction detail page with reference number information

## Tech Stack

- Node.js
- Express.js
- MySQL with mysql2
- EJS templates
- Bootstrap/CSS
- express-session
- bcrypt
- dotenv

## Project Structure

```text
upi_transaction/
  config/              Database config re-export
  controllers/         Request handlers
  database/            MySQL connection, schema, and seed SQL
  middleware/          Auth and validation middleware
  models/              Database query modules
  public/              CSS and client-side JavaScript
  routes/              Express route definitions
  views/               EJS templates and partials
  index.js             Application entry point
  package.json         Dependencies and scripts
```

## Prerequisites

- Node.js
- MySQL Server
- npm

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the `upi_transaction` folder:

```env
PORT=3000
SESSION_SECRET=replace_with_a_secret_value
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=upi_transaction_system
```

3. Create and seed the database:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

The schema creates these tables:

- `users`
- `banks`
- `bank_accounts`
- `transactions`

## Run the App

Start the application:

```bash
npm start
```

For development with automatic restarts:

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

## Deploy on Railway

Railway is a simple option for this project because it can run the Node.js app and a MySQL database in the same project.

1. Push the project to GitHub.
2. In Railway, create a new project from the GitHub repository.
3. Set the root directory to `upi_transaction` if Railway asks for it.
4. Add a MySQL database service in the same Railway project.
5. In the Node app service variables, add:

```env
NODE_ENV=production
SESSION_SECRET=replace_with_a_long_random_secret
```

6. Add database variables using Railway's MySQL service values. This app supports either:

```env
DATABASE_URL=mysql://user:password@host:3306/database
```

or individual variables:

```env
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_mysql_database
```

Railway also exposes MySQL variables such as `MYSQL_URL`, `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, and `MYSQLDATABASE`; the app can read those too.

7. Use these deploy commands:

```text
Build Command: npm install
Start Command: npm start
```

8. Import the database schema into the production MySQL database:

```bash
mysql -h your_mysql_host -P 3306 -u your_mysql_user -p your_mysql_database < database/schema.sql
mysql -h your_mysql_host -P 3306 -u your_mysql_user -p your_mysql_database < database/seed.sql
```

Do not upload your local `.env` file to GitHub or Railway. Add secrets in the hosting dashboard.

## Main Routes

- `/` - Home page
- `/signup` - Create a user account
- `/login` - Login
- `/logout` - Logout
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/banks` - Available banks
- `/bank/add-account` - Link a bank account
- `/bank/accounts` - View linked accounts
- `/upi/pay` - Send money
- `/upi/verify` - Verify receiver UPI ID
- `/transaction/history` - View transaction history
- `/transaction/:id` - View transaction details

## Notes

- Users must be logged in before accessing dashboard, profile, bank, UPI, and transaction pages.
- A receiver must have at least one linked bank account to receive money.
- UPI PINs and passwords are stored as bcrypt hashes.
- Transfers use MySQL transactions and row locks to prevent duplicate spending during concurrent payments.
