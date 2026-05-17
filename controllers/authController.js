const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

function showSignup(req, res) {
  res.render('signup', { title: 'Signup' });
}

async function signup(req, res) {
  try {
    const { name, phone_no, email_id, password, upi_id } = req.body;

    const existingUser = await userModel.checkUniqueUser(email_id, phone_no, upi_id);
    if (existingUser) {
      req.session.message = { type: 'danger', text: 'Email, phone number, or UPI ID already exists.' };
      return res.redirect('/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser({
      name,
      phone_no,
      email_id,
      password: hashedPassword,
      upi_id
    });

    req.session.user = {
      user_id: userId,
      name,
      email_id,
      upi_id
    };
    req.session.message = { type: 'success', text: 'Account created successfully.' };
    return res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    req.session.message = { type: 'danger', text: 'Unable to create account.' };
    return res.redirect('/signup');
  }
}

function showLogin(req, res) {
  res.render('login', { title: 'Login' });
}

async function login(req, res) {
  try {
    const { email_id, password } = req.body;
    const user = await userModel.findByEmail(email_id);

    if (!user) {
      req.session.message = { type: 'danger', text: 'Invalid email or password.' };
      return res.redirect('/login');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      req.session.message = { type: 'danger', text: 'Invalid email or password.' };
      return res.redirect('/login');
    }

    req.session.user = {
      user_id: user.user_id,
      name: user.name,
      email_id: user.email_id,
      upi_id: user.upi_id
    };

    return res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    req.session.message = { type: 'danger', text: 'Login failed.' };
    return res.redirect('/login');
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}

module.exports = {
  showSignup,
  signup,
  showLogin,
  login,
  logout
};
