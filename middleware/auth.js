function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  req.flash("error", "Veuillez vous connecter.");
  res.redirect("/login");
}
function ensureRole(role) {
  return (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === role) return next();
    req.flash("error", "Accès refusé: rôle requis (" + role + ").");
    res.redirect("/");
  };
}
module.exports = { ensureAuthenticated, ensureRole };
