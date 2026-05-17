function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  req.session.message = { type: 'warning', text: 'Please login first.' };
  return res.redirect('/login');
}

function isGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }

  return next();
}

module.exports = {
  isAuthenticated,
  isGuest
};
