const express = require("express");
const PDFDocument = require("pdfkit");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const invoices = await db.getInvoices();
  const cases = await db.getCases();
  res.render("invoices/list", { title: "Factures", invoices, cases });
});

router.post("/", async (req, res) => {
  try {
    await db.createInvoice(req.body);
    req.flash("success", "Facture créée.");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
  }
  res.redirect("/factures");
});

router.post("/:id", async (req, res) => {
  try {
    await db.updateInvoice(req.params.id, req.body);
    req.flash("success", "Facture mise à jour.");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
  }
  res.redirect("/factures");
});

router.post("/:id/delete", async (req, res) => {
  if (!(req.session.user && req.session.user.role === 'admin')) { req.flash('error', 'Suppression réservée aux administrateurs.'); return res.redirect('back'); }

  try {
    await db.deleteInvoice(req.params.id);
    req.flash("success", "Facture supprimée.");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
  }
  res.redirect("/factures");
});

// Générer un PDF simple de facture
router.get("/:id/pdf", async (req, res) => {
  const inv = await db.getInvoice(req.params.id);
  if (!inv) return res.redirect("/factures");
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=facture-${inv.id}.pdf`);
  doc.pipe(res);
  doc.fontSize(20).text("FACTURE", { align: "center" }).moveDown();
  doc.fontSize(12).text(`N°: ${inv.id}`);
  doc.text(`Dossier: ${inv.case_title}`);
  doc.text(`Montant: ${inv.amount} USD`);
  doc.text(`Statut: ${inv.status}`);
  doc.text(`Émise le: ${inv.issued_at}`);
  if (inv.notes) { doc.moveDown().text("Notes:"); doc.text(inv.notes); }
  doc.moveDown().text("Merci pour votre confiance.", { align: "center" });
  doc.end();
});

module.exports = router;
