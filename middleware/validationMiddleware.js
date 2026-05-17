function requireFields(fields) {
  return (req, res, next) => {
    const missingFields = fields.filter((field) => !String(req.body[field] || '').trim());

    if (missingFields.length > 0) {
      req.session.message = {
        type: 'danger',
        text: `Please fill: ${missingFields.join(', ')}`
      };
      return res.redirect('back');
    }

    return next();
  };
}

module.exports = {
  requireFields
};
