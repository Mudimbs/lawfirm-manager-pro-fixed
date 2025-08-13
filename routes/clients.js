const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  let clients = await db.getClients();
  if (q) {
    clients = clients.filter(c => (c.fullname||"").toLowerCase().includes(q) || (c.email||"").toLowerCase().includes(q) || (c.phone||"").toLowerCase().includes(q));
  }
  res.render("clients/list", { title: "Clients", clients, q });
});

router.get("/new", (req, res) => {
  res.render("clients/new", { title: "Nouveau client" });
});

router.post("/", async (req, res) => {
  try {
    await db.createClient(req.body);
    req.flash("success", "Client créé avec succès.");
    res.redirect("/clients");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
    res.redirect("/clients/new");
  }
});

router.get("/:id/edit", async (req, res) => {
  const client = await db.getClient(req.params.id);
  if (!client) return res.redirect("/clients");
  res.render("clients/edit", { title: "Modifier client", client });
});

router.post("/:id", async (req, res) => {
  try {
    await db.updateClient(req.params.id, req.body);
    req.flash("success", "Client mis à jour.");
    res.redirect("/clients");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
    res.redirect("/clients");
  }
});

router.post("/:id/delete", async (req, res) => {
  if (!(req.session.user && req.session.user.role === 'admin')) { req.flash('error', 'Suppression réservée aux administrateurs.'); return res.redirect('back'); }

  try {
    await db.deleteClient(req.params.id);
    req.flash("success", "Client supprimé.");
    res.redirect("/clients");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
    res.redirect("/clients");
  }
});

module.exports = router;
