const express = require("express");
const PDFDocument = require("pdfkit");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const cases = await db.getCases();
  res.render("documents/index", { title: "Modèles de documents", cases });
});

function pdfHeader(doc, title) {
  doc.fontSize(16).text("Cabinet d'Avocats", { align: "right" });
  doc.fontSize(10).text(new Date().toLocaleString(), { align: "right" });
  doc.moveDown().moveTo(50, 90).lineTo(545, 90).stroke();
  doc.fontSize(18).text(title, { align: "center" }).moveDown();
}

router.post("/assignation/pdf", async (req, res) => {
  const { case_id, destinataire, objet, corps } = req.body;
  const dossier = await db.getCase(case_id);
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=assignation.pdf");
  doc.pipe(res);
  pdfHeader(doc, "Assignation");
  doc.fontSize(12).text(`Dossier: ${dossier.title} (${dossier.reference || "réf. s/o"})`);
  doc.text(`Client: ${dossier.client_name}`);
  doc.moveDown();
  doc.text(`Destinataire: ${destinataire}`);
  doc.text(`Objet: ${objet}`);
  doc.moveDown();
  doc.text(corps || "Corps de l'assignation...", { align: "left" });
  doc.moveDown().text("Signature: ____________________", { align: "right" });
  doc.end();
});

router.post("/recu/pdf", async (req, res) => {
  const { case_id, montant, note } = req.body;
  const dossier = await db.getCase(case_id);
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=recu.pdf");
  doc.pipe(res);
  pdfHeader(doc, "Reçu de paiement");
  doc.fontSize(12).text(`Dossier: ${dossier.title} (${dossier.reference || "réf. s/o"})`);
  doc.text(`Client: ${dossier.client_name}`);
  doc.moveDown();
  doc.fontSize(14).text(`Montant reçu: ${montant} USD`, { align: "left" });
  if (note) { doc.moveDown().fontSize(12).text("Note:"); doc.text(note); }
  doc.moveDown().text("Fait le: " + new Date().toLocaleDateString());
  doc.moveDown().text("Signature: ____________________", { align: "right" });
  doc.end();
});

module.exports = router;
