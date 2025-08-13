const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db");

router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Connexion" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.findUserByEmail(email);
  if (!user) {
    req.flash("error", "Identifiants invalides.");
    return res.redirect("/login");
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    req.flash("error", "Identifiants invalides.");
    return res.redirect("/login");
  }
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  req.flash("success", "Bienvenue " + user.name + " !");
  res.redirect("/");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
