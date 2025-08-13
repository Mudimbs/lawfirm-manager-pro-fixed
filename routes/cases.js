const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const db = require("../db");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
  }
});
const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  let cases = await db.getCases();
  const q = (req.query.q || "").toLowerCase();
  const status = req.query.status || "";
  if (q) { cases = cases.filter(d => (d.title||"").toLowerCase().includes(q) || (d.reference||"").toLowerCase().includes(q)); }
  if (status) { cases = cases.filter(d => d.status === status); }
  res.render("cases/list", { title: "Dossiers", cases, q });
});

router.get("/new", async (req, res) => {
  const clients = await db.getClients();
  res.render("cases/new", { title: "Nouveau dossier", clients });
});

router.post("/", async (req, res) => {
  try {
    await db.createCase(req.body);
    req.flash("success", "Dossier créé.");
    res.redirect("/dossiers");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
    res.redirect("/dossiers/new");
  }
});

router.get("/:id/edit", async (req, res) => {
  const dossier = await db.getCase(req.params.id);
  const clients = await db.getClients();
  if (!dossier) return res.redirect("/dossiers");
  res.render("cases/edit", { title: "Modifier dossier", dossier, clients });
});

router.post("/:id", async (req, res) => {
  try {
    await db.updateCase(req.params.id, req.body);
    req.flash("success", "Dossier mis à jour.");
    res.redirect("/dossiers");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
    res.redirect("/dossiers");
  }
});

router.post("/:id/delete", async (req, res) => {
  if (!(req.session.user && req.session.user.role === 'admin')) { req.flash('error', 'Suppression réservée aux administrateurs.'); return res.redirect('back'); }

  try {
    await db.deleteCase(req.params.id);
    req.flash("success", "Dossier supprimé.");
    res.redirect("/dossiers");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
    res.redirect("/dossiers");
  }
});

// (Optionnel) Upload de documents liés au dossier
router.post("/:id/upload", upload.single("document"), async (req, res) => {
  if (!req.file) {
    req.flash("error", "Aucun fichier reçu.");
    return res.redirect(`/dossiers/${req.params.id}/edit`);
  }
  // Ici on pourrait enregistrer le document dans la table documents
  req.flash("success", "Document uploadé: " + req.file.originalname);
  res.redirect(`/dossiers/${req.params.id}/edit`);
});

module.exports = router;
