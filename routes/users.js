const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const users = await db.getUsers();
  res.render("users/list", { title: "Utilisateurs", users });
});

router.post("/", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    await db.createUser({ name: req.body.name, email: req.body.email, password_hash: hash, role: req.body.role || "utilisateur" });
    req.flash("success", "Utilisateur créé.");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
  }
  res.redirect("/utilisateurs");
});

router.post("/:id/password", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    await db.updatePassword(req.params.id, hash);
    req.flash("success", "Mot de passe mis à jour.");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
  }
  res.redirect("/utilisateurs");
});

module.exports = router;
