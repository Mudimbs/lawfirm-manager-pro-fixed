const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const clients = await db.getClients();
  const cases = await db.getCases();
  res.render("dashboard", { title: "Tableau de bord", clientsCount: clients.length, casesCount: cases.length });
});

module.exports = router;
