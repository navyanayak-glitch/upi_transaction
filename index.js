const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bankRoutes = require('./routes/bankRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const upiRoutes = require('./routes/upiRoutes');

const app = express();
const http = require('http');
const { initRealtime } = require('./realtime');
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'upi_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60
    }
  })
);

// Make user and flash messages available in every EJS page.
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.message = req.session.message || null;
  res.locals.currentPath = req.path;
  delete req.session.message;
  next();
});

app.get('/', (req, res) => {
  res.render('home', { title: 'UPI Transaction Management System' });
});

app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/bank', bankRoutes);
app.use('/transaction', transactionRoutes);
app.use('/upi', upiRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    errorCode: 404,
    errorMessage: 'The page you are looking for does not exist.'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Server Error',
    errorCode: 500,
    errorMessage: 'Something went wrong. Please try again later.'
  });
});

const server = http.createServer(app);

// Initialize realtime (Socket.IO) with the HTTP server
initRealtime(server);

server.listen(PORT, HOST, () => {
  console.log(`UPI Transaction Management System running on http://${HOST}:${PORT}`);
});
