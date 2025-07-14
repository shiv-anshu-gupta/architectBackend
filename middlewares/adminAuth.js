function adminAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.redirect("/admin");
}

module.exports = adminAuth;
