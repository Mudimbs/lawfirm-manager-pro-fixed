const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { db } = require("../db");

router.get("/db", (req, res) => {
  const dbPath = path.join(__dirname, "..", "lawfirm.db");
  res.download(dbPath, "lawfirm-backup.db");
});

router.get("/clients.csv", (req, res) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=clients.csv");
  db.all("SELECT * FROM clients", [], (err, rows) => {
    if (err) return res.sendStatus(500);
    const header = Object.keys(rows[0] || {id:"", fullname:"", phone:"", email:"", address:"", notes:"", created_at:""});
    res.write(header.join(",") + "\n");
    for (const r of rows) {
      res.write(header.map(k => String(r[k] || '').replace(/,/g,' ')).join(",") + "\n");
    }
    res.end();
  });
});

router.get("/dossiers.csv", (req, res) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=dossiers.csv");
  db.all("SELECT * FROM cases", [], (err, rows) => {
    if (err) return res.sendStatus(500);
    const header = Object.keys(rows[0] || {id:"", title:"", reference:"", client_id:"", status:"", description:"", created_at:""});
    res.write(header.join(",") + "\n");
    for (const r of rows) {
      res.write(header.map(k => String(r[k] || '').replace(/,/g,' ')).join(",") + "\n");
    }
    res.end();
  });
});

module.exports = router;
