const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const hearings = await db.getHearings();
  const cases = await db.getCases();
  res.render("hearings/list", { title: "Audiences", hearings, cases });
});

router.post("/", async (req, res) => {
  try {
    await db.createHearing(req.body);
    req.flash("success", "Audience ajoutée.");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
  }
  res.redirect("/audiences");
});

router.post("/:id/delete", async (req, res) => {
  try {
    await db.deleteHearing(req.params.id);
    req.flash("success", "Audience supprimée.");
  } catch (e) {
    req.flash("error", "Erreur: " + e.message);
  }
  res.redirect("/audiences");
});

module.exports = router;


const nodemailer = require("nodemailer");

// Export .ics for one hearing
router.get("/:id/ics", async (req, res) => {
  const hearings = await db.getHearings();
  const h = hearings.find(x => String(x.id) === String(req.params.id));
  if (!h) return res.redirect("/audiences");
  const dt = new Date(h.date);
  const dtStart = dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dtEnd = new Date(dt.getTime() + 60*60*1000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; // +1h
  const uid = `hearing-${h.id}@lawfirm.local`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LawFirm Manager//Audiences//FR",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Audience - ${h.case_title}`,
    `LOCATION:${(h.location || "").replace(/\n/g, " ")}`,
    `DESCRIPTION:${(h.notes || "").replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=audience-${h.id}.ics`);
  res.send(ics);
});

// Send reminder email (requires SMTP env vars)
router.post("/:id/email", async (req, res) => {
  const hearings = await db.getHearings();
  const h = hearings.find(x => String(x.id) === String(req.params.id));
  if (!h) { req.flash("error", "Audience introuvable."); return res.redirect("/audiences"); }
  const { to } = req.body;
  if (!to) { req.flash("error", "Adresse email requise."); return res.redirect("/audiences"); }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    });

    const subject = `Rappel d'audience – ${h.case_title}`;
    const text = `Bonjour,\n\nRappel d'audience:\nDossier: ${h.case_title}\nDate: ${h.date}\nLieu: ${h.location || ""}\nNotes: ${h.notes || ""}\n\nCordialement,\nLawFirm Manager`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM || "noreply@cabinet.local",
      to,
      subject,
      text
    });
    req.flash("success", "Email envoyé à " + to);
  } catch (e) {
    req.flash("error", "Échec de l'envoi: " + e.message + " (vérifiez votre configuration SMTP)");
  }
  res.redirect("/audiences");
});
